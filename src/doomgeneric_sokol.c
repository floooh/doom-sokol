//------------------------------------------------------------------------------
//  doomgeneric_sokol.c
//
//  This is all the sokol-backend-specific code, including the entry
//  point sokol_main().
//------------------------------------------------------------------------------
#include "sokol_app.h"
#include "sokol_gfx.h"
#include "sokol_debugtext.h"
#include "sokol_fetch.h"
#include "sokol_audio.h"
#include "sokol_log.h"
#include "sokol_glue.h"
#include "m_argv.h"
#include "d_event.h"
#include "i_video.h"
#include "i_sound.h"
#include "w_wad.h"
#include "sounds.h"
#include "doomgeneric.h"
#include "doomkeys.h"
#include <assert.h>
#include "sokol_shaders.glsl.h"

#define MUS_IMPLEMENTATION
#include "mus.h"
#define TSF_IMPLEMENTATION
#include "tsf.h"

#include <math.h>  // round

// in m_menu.c
extern boolean menuactive;

void D_DoomMain(void);
void D_DoomLoop(void);
void D_DoomFrame(void);
void dg_Create();

#define KEY_QUEUE_SIZE (32)
#define MAXSAMPLECOUNT (2048)
#define NUM_CHANNELS (8)
#define MIXBUFFERSIZE (MAXSAMPLECOUNT * 2)
#define MAX_WAD_SIZE (6 * 1024 * 1024)
#define MAX_SOUNDFONT_SIZE (2 * 1024 * 1024)

typedef enum {
    APP_STATE_LOADING,
    APP_STATE_WAITING,
    APP_STATE_INIT,
    APP_STATE_RUNNING,
    APP_STATE_LOADING_FAILED,
} app_state_t;

typedef struct {
    uint8_t key_code;
    bool pressed;
} key_state_t;

typedef struct {
    uint8_t* cur_ptr;
    uint8_t* end_ptr;
    int sfxid;
    int handle;
    int leftvol;
    int rightvol;
} snd_channel_t;

typedef enum {
    DATA_STATE_LOADING,
    DATA_STATE_VALID,
    DATA_STATE_FAILED,
} data_state_t;

static struct {
    app_state_t state;
    uint32_t frames_per_tick;   // number of frames per game tick
    uint32_t frame_tick_counter;
    struct {
        sg_buffer vbuf;
        sg_image pal_img;       // 256x1 palette lookup texture
        sg_image pix_img;       // 320x200 R8 framebuffer texture
        sg_image rgba_img;      // 320x200 RGBA8 framebuffer texture
        sg_sampler smp_palettize;   // sampler for the palettization pass
        sg_sampler smp_upscale;     // sampler for the upscale pass
        sg_pipeline offscreen_pip;
        sg_pipeline display_pip;
        sg_pass offscreen_pass;
    } gfx;
    struct {
        key_state_t key_queue[KEY_QUEUE_SIZE];
        uint32_t key_write_index;
        uint32_t key_read_index;
        uint32_t mouse_button_state;
        uint32_t delayed_mouse_button_up;
    } inp;
    struct {
        bool use_sfx_prefix;
        uint16_t cur_sfx_handle;
        snd_channel_t channels[NUM_CHANNELS];
        uint32_t resample_outhz;
        uint32_t resample_inhz;
        uint32_t resample_accum;
        float cur_left_sample;
        float cur_right_sample;
        int lengths[NUMSFX];        // length in bytes/samples of sound effects
        float mixbuffer[MIXBUFFERSIZE];
    } sound;
    struct {
        tsf* sound_font;
        void* cur_song_data;
        int cur_song_len;
        int volume;
        mus_t* mus;
        bool reset;
        int leftover;
    } music;
    struct {
        struct {
            data_state_t state;
            size_t size;
            uint8_t buf[MAX_WAD_SIZE];
        } wad;
        struct {
            data_state_t state;
            size_t size;
            uint8_t buf[MAX_SOUNDFONT_SIZE];
        } sf;
    } data;
} app;

void wad_fetch_callback(const sfetch_response_t* response) {
    if (response->fetched) {
        app.data.wad.size = response->data.size;
        app.data.wad.state = DATA_STATE_VALID;
        if (app.data.sf.state == DATA_STATE_VALID) {
            app.state = APP_STATE_WAITING;
        }
    }
    else if (response->failed) {
        app.state = APP_STATE_LOADING_FAILED;
        app.data.wad.state = DATA_STATE_FAILED;
    }
}

void sf_fetch_callback(const sfetch_response_t* response) {
    if (response->fetched) {
        app.data.sf.size = response->data.size;
        app.data.sf.state = DATA_STATE_VALID;
        if (app.data.wad.state == DATA_STATE_VALID) {
            app.state = APP_STATE_WAITING;
        }
    }
    else if (response->failed) {
        app.state = APP_STATE_LOADING_FAILED;
        app.data.sf.state = DATA_STATE_FAILED;
    }
}

void init(void) {
    // initialize sokol-time, -gfx, -debugtext and -fetch
    sg_setup(&(sg_desc){
        .buffer_pool_size = 8,
        .image_pool_size = 8,
        .shader_pool_size = 8,
        .pipeline_pool_size = 8,
        .context_pool_size = 1,
        .context = sapp_sgcontext(),
        .logger.func = slog_func,
    });
    sdtx_setup(&(sdtx_desc_t){
        .context_pool_size = 1,
        .fonts[0] = sdtx_font_kc854(),
        .logger.func = slog_func,
    });
    sfetch_setup(&(sfetch_desc_t){
        .max_requests = 2,
        .num_channels = 1,
        .num_lanes = 2,
        .logger.func = slog_func,
    });
    saudio_setup(&(saudio_desc){
        .buffer_frames = MAXSAMPLECOUNT,
        .packet_frames = 128,
        .num_packets = MAXSAMPLECOUNT / 128,
        .num_channels = 2,
        .logger.func = slog_func,
    });

    // a vertex buffer to render a fullscreen triangle
    const float verts[] = {
        0.0f, 0.0f,
        2.0f, 0.0f,
        0.0f, 2.0f
    };
    app.gfx.vbuf = sg_make_buffer(&(sg_buffer_desc){
        .data = SG_RANGE(verts),
    });

    // a dynamic texture for Doom's framebuffer
    app.gfx.pix_img = sg_make_image(&(sg_image_desc){
        .width = SCREENWIDTH,
        .height = SCREENHEIGHT,
        .pixel_format = SG_PIXELFORMAT_R8,
        .usage = SG_USAGE_STREAM,
    });

    // another dynamic texture for the color palette
    app.gfx.pal_img = sg_make_image(&(sg_image_desc){
        .width = 256,
        .height = 1,
        .pixel_format = SG_PIXELFORMAT_RGBA8,
        .usage = SG_USAGE_STREAM,
    });

    // an RGBA8 texture to hold the 'color palette expanded' image
    // and source for upscaling with linear filtering
    app.gfx.rgba_img = sg_make_image(&(sg_image_desc){
        .render_target = true,
        .width = SCREENWIDTH,
        .height = SCREENHEIGHT,
        .pixel_format = SG_PIXELFORMAT_RGBA8,
        .usage = SG_USAGE_IMMUTABLE,
    });

    // a sampler with nearest filtering for the palettization pass
    app.gfx.smp_palettize = sg_make_sampler(&(sg_sampler_desc){
        .min_filter = SG_FILTER_NEAREST,
        .mag_filter = SG_FILTER_NEAREST,
        .wrap_u = SG_WRAP_CLAMP_TO_EDGE,
        .wrap_v = SG_WRAP_CLAMP_TO_EDGE,
    });

    // a sampler with linear filtering for the upscaling pass
    app.gfx.smp_upscale = sg_make_sampler(&(sg_sampler_desc){
        .min_filter = SG_FILTER_LINEAR,
        .mag_filter = SG_FILTER_LINEAR,
        .wrap_u = SG_WRAP_CLAMP_TO_EDGE,
        .wrap_v = SG_WRAP_CLAMP_TO_EDGE,
    });

    // a pipeline object for the offscreen render pass which
    // performs the color palette lookup
    app.gfx.offscreen_pip = sg_make_pipeline(&(sg_pipeline_desc){
        .shader = sg_make_shader(offscreen_shader_desc(sg_query_backend())),
        .layout = {
            .attrs[0].format = SG_VERTEXFORMAT_FLOAT2
        },
        .cull_mode = SG_CULLMODE_NONE,
        .depth = {
            .write_enabled = false,
            .compare = SG_COMPAREFUNC_ALWAYS,
            .pixel_format = SG_PIXELFORMAT_NONE,
        },
        .colors[0].pixel_format = SG_PIXELFORMAT_RGBA8,
    });

    // a pipeline object to upscale the offscreen RGBA8 framebuffer
    // texture to the display
    app.gfx.display_pip = sg_make_pipeline(&(sg_pipeline_desc){
        .shader = sg_make_shader(display_shader_desc(sg_query_backend())),
        .layout = {
            .attrs[0].format = SG_VERTEXFORMAT_FLOAT2
        },
        .cull_mode = SG_CULLMODE_NONE,
        .depth = {
            .write_enabled = false,
            .compare = SG_COMPAREFUNC_ALWAYS,
        },
    });

    // a render pass object for the offscreen pass
    app.gfx.offscreen_pass = sg_make_pass(&(sg_pass_desc){
        .color_attachments[0].image = app.gfx.rgba_img,
    });

    // start loading the DOOM1.WAD and soundfont files, the game start will be delayed
    // until loading has finished (see the frame() callback below)
    // NOTE: those files have .wasm extension only so that they are compressed
    // by web servers, they are not actually WASM files!
    sfetch_send(&(sfetch_request_t){
        .path = "doom1.wad.wasm",
        .callback = wad_fetch_callback,
        .buffer = SFETCH_RANGE(app.data.wad.buf),
    });
    sfetch_send(&(sfetch_request_t){
        .path = "aweromgm.sf2.wasm",
        .callback = sf_fetch_callback,
        .buffer = SFETCH_RANGE(app.data.sf.buf),
    });
    app.state = APP_STATE_LOADING;
}

static void draw_loading_msg(const char* name, data_state_t data_state) {
    sdtx_color3f(0.75f, 0.75f, 0.75f);
    sdtx_printf("Loading %s", name);
    switch (data_state) {
        case DATA_STATE_LOADING:
            for (int i = 0; i < ((sapp_frame_count() / 20) & 3); i++) {
                sdtx_putc('.');
            }
            sdtx_putc('\n');
            break;
        case DATA_STATE_VALID:
            sdtx_puts(" ... OK\n");
            break;
        case DATA_STATE_FAILED:
            sdtx_puts(" ... ");
            if ((sapp_frame_count() / 20) & 1) {
                sdtx_color3f(1.0f, 0.0f, 0.0f);
                sdtx_puts("FAILED!\n");
            }
            else {
                sdtx_putc('\n');
            }
            break;
    }
    sdtx_color3f(0.75f, 0.75f, 0.75f);
}

// draw a simple loading message during async WAD file loading
static void draw_greeting_screen(void) {
    sdtx_canvas(sapp_widthf(), sapp_height() * 0.5f);
    sdtx_origin(2.0f, 1.0f);
    sdtx_color3f(0.75f, 0.75f, 0.75f);
    sdtx_puts("*** DOOM (shareware) ***\n\n");
    sdtx_puts("Ported to the Sokol headers.\n\n");
    sdtx_puts("Project URL: https://github.com/floooh/doom-sokol\n\n");
    sdtx_puts("Controls:\n");
    sdtx_puts("=========\n\n");
    sdtx_puts("Arrow keys:     move and turn\n\n");
    sdtx_puts("Mouse move:     turn left/right\n\n");
    sdtx_puts("Alt+arrow keys: move and strafe\n\n");
    sdtx_puts("AWSD:           move and strafe\n\n");
    sdtx_puts("Shift:          run\n\n");
    sdtx_puts("1 - 7:          select weapon\n\n");
    sdtx_puts("Ctrl / LMB:     fire weapon\n\n");
    sdtx_puts("Space:          use door\n\n");
    sdtx_puts("\n");

    draw_loading_msg("WAD file", app.data.wad.state);
    draw_loading_msg("sound font", app.data.sf.state);

    if (app.state == APP_STATE_WAITING) {
        if ((sapp_frame_count() / 20) & 1) {
            sdtx_puts("\nPress any key to start game!");
        }
    }

    sg_pass_action pass_action = {
        .colors[0] = { .load_action = SG_LOADACTION_CLEAR, .clear_value = { 0.0f, 0.0f, 0.0f, 1.0f } }
    };
    sg_begin_default_pass(&pass_action, sapp_width(), sapp_height());
    sdtx_draw();
    sg_end_pass();
    sg_commit();
}

// helper function to adjust aspect ratio
static void apply_viewport(float canvas_width, float canvas_height) {
    const float canvas_aspect = canvas_width / canvas_height;
    const float doom_width = (float)SCREENWIDTH;
    const float doom_height = (float)SCREENHEIGHT;
    const float doom_aspect = doom_width / doom_height;
    float vp_x, vp_y, vp_w, vp_h;
    if (doom_aspect < canvas_aspect) {
        vp_y = 0.0f;
        vp_h = canvas_height;
        vp_w = canvas_height * doom_aspect;
        vp_x = (canvas_width - vp_w) / 2;
    }
    else {
        vp_x = 0.0f;
        vp_w = canvas_width;
        vp_h = canvas_width / doom_aspect;
        vp_y = (canvas_height - vp_h) / 2;
    }
    sg_apply_viewport(vp_x, vp_y, vp_w, vp_h, true);
}

// copy the Doom framebuffer into sokol-gfx texture and render to display
static void draw_game_frame(void) {
    // update pixel and palette textures
    sg_update_image(app.gfx.pix_img, &(sg_image_data){
        .subimage[0][0] = {
            .ptr = I_VideoBuffer,
            .size = SCREENWIDTH * SCREENHEIGHT,
        }
    });
    sg_update_image(app.gfx.pal_img, &(sg_image_data){
        .subimage[0][0] = {
            .ptr = I_GetPalette(),
            .size = 256 * sizeof(uint32_t)
        }
    });

    // offscreen render pass to perform color palette lookup
    const sg_pass_action offscreen_pass_action = { .colors[0] = { .load_action = SG_LOADACTION_DONTCARE } };
    sg_begin_pass(app.gfx.offscreen_pass, &offscreen_pass_action);
    sg_apply_pipeline(app.gfx.offscreen_pip);
    sg_apply_bindings(&(sg_bindings){
        .vertex_buffers[0] = app.gfx.vbuf,
        .fs = {
            .images = {
                [SLOT_pix_img] = app.gfx.pix_img,
                [SLOT_pal_img] = app.gfx.pal_img,
            },
            .samplers[SLOT_smp] = app.gfx.smp_palettize,
        }
    });
    sg_draw(0, 3, 1);
    sg_end_pass();

    // render resulting texture to display framebuffer with upscaling
    const sg_pass_action display_pass_action = {
        .colors[0] = {
            .load_action = SG_LOADACTION_CLEAR,
            .clear_value = { 0.0f, 0.0f, 0.0f, 1.0f }
        }
    };
    sg_begin_default_pass(&display_pass_action, sapp_width(), sapp_height());
    sg_apply_pipeline(app.gfx.display_pip);
    sg_apply_bindings(&(sg_bindings){
        .vertex_buffers[0] = app.gfx.vbuf,
        .fs = {
            .images[SLOT_rgba_img] = app.gfx.rgba_img,
            .samplers[SLOT_smp] = app.gfx.smp_upscale,
        },
    });
    apply_viewport(sapp_widthf(), sapp_heightf());
    sg_draw(0, 3, 1);
    sg_end_pass();
    sg_commit();
}

static void snd_mix(int);
static void mus_mix(int);
static void update_game_audio() {
    const int num_frames = saudio_expect();
    if (num_frames > 0) {
        assert(num_frames <= MAXSAMPLECOUNT);
        snd_mix(num_frames);
        mus_mix(num_frames);
        saudio_push(app.sound.mixbuffer, num_frames);
    }
}

void frame(void) {
    sfetch_dowork();

    // compute frames-per-tick to get us close to the ideal 35 Hz game tick
    // but without skipping ticks
    double frame_time_ms = sapp_frame_duration() * 1000.0;
    if (frame_time_ms > 40.0) {
        // prevent overly long frames (for instance when in debugger)
        frame_time_ms = 40.0;
    }
    const double tick_time_ms = 1000.0 / 35.0;
    app.frames_per_tick = (uint32_t) round(tick_time_ms / frame_time_ms);

    switch (app.state) {
        case APP_STATE_LOADING:
        case APP_STATE_WAITING:
        case APP_STATE_LOADING_FAILED:
            draw_greeting_screen();
            break;
        case APP_STATE_INIT:
            dg_Create();
            // D_DoomMain() without the trailing call to D_DoomLoop()
            D_DoomMain();
            app.state = APP_STATE_RUNNING;
            // fallthough!
        case APP_STATE_RUNNING:
            if (++app.frame_tick_counter >= app.frames_per_tick) {
                app.frame_tick_counter = 0;
                D_DoomFrame();
                // this prevents that very short mouse button taps on touchpads are not deteced
                if (app.inp.delayed_mouse_button_up != 0) {
                    app.inp.mouse_button_state &= ~app.inp.delayed_mouse_button_up;
                    app.inp.delayed_mouse_button_up = 0;
                    D_PostEvent(&(event_t){
                        .type = ev_mouse,
                        .data1 = app.inp.mouse_button_state
                    });
                }
            }
            update_game_audio();
            draw_game_frame();
            break;
    }
}

void cleanup(void) {
    tsf_close(app.music.sound_font);
    saudio_shutdown();
    sfetch_shutdown();
    sdtx_shutdown();
    sg_shutdown();
}

static void push_key(uint8_t key_code, bool pressed) {
    if (key_code != 0) {
        assert(app.inp.key_write_index < KEY_QUEUE_SIZE);
        app.inp.key_queue[app.inp.key_write_index] = (key_state_t) {
            .key_code = key_code,
            .pressed = pressed
        };
        app.inp.key_write_index = (app.inp.key_write_index + 1) % KEY_QUEUE_SIZE;
    }
}

static key_state_t pull_key(void) {
    if (app.inp.key_read_index == app.inp.key_write_index) {
        return (key_state_t){0};
    }
    else {
        assert(app.inp.key_read_index < KEY_QUEUE_SIZE);
        key_state_t res = app.inp.key_queue[app.inp.key_read_index];
        app.inp.key_read_index = (app.inp.key_read_index + 1) % KEY_QUEUE_SIZE;
        return res;
    }
}

// originally in i_video.c
static int AccelerateMouse(int val) {
    if (val < 0) {
        return -AccelerateMouse(-val);
    }
    // Win32 hack to speed up mouse, this should probably happen in sokol_app.h
    #ifdef _WIN32
    val *= 4;
    #endif
    if (val > mouse_threshold) {
        return (int)((val - mouse_threshold) * mouse_acceleration + mouse_threshold);
    }
    else
    {
        return val;
    }
}

void input(const sapp_event* ev) {
    if (app.state == APP_STATE_WAITING) {
        if ((ev->type == SAPP_EVENTTYPE_KEY_DOWN) ||
            (ev->type == SAPP_EVENTTYPE_MOUSE_DOWN) ||
            (ev->type == SAPP_EVENTTYPE_TOUCHES_BEGAN))
        {
            app.state = APP_STATE_INIT;
        }
    }
    else if (app.state == APP_STATE_RUNNING) {
        if (menuactive && sapp_mouse_locked()) {
            sapp_lock_mouse(false);
        }
        if (!menuactive && !sapp_mouse_locked()) {
            sapp_lock_mouse(true);
        }
        if (ev->type == SAPP_EVENTTYPE_UNFOCUSED) {
            // clear all input when window loses focus
            push_key(KEY_UPARROW, false);
            push_key(KEY_DOWNARROW, false);
            push_key(KEY_LEFTARROW, false);
            push_key(KEY_RIGHTARROW, false);
            push_key(KEY_STRAFE_L, false);
            push_key(KEY_STRAFE_R, false);
            push_key(KEY_FIRE, false);
            push_key(KEY_USE, false);
            push_key(KEY_TAB, false);
            push_key(KEY_RSHIFT, false);
            push_key(KEY_ESCAPE, false);
            push_key(KEY_ENTER, false);
            push_key('1', false);
            push_key('2', false);
            push_key('3', false);
            push_key('4', false);
            push_key('5', false);
            push_key('6', false);
            push_key('7', false);
        }
        else if ((ev->type == SAPP_EVENTTYPE_KEY_DOWN) || (ev->type == SAPP_EVENTTYPE_KEY_UP)) {
            bool pressed = (ev->type == SAPP_EVENTTYPE_KEY_DOWN);
            bool consume_event = true;
            switch (ev->key_code) {
                case SAPP_KEYCODE_W:
                case SAPP_KEYCODE_UP:
                    push_key(KEY_UPARROW, pressed);
                    break;
                case SAPP_KEYCODE_S:
                case SAPP_KEYCODE_DOWN:
                    push_key(KEY_DOWNARROW, pressed);
                    break;
                case SAPP_KEYCODE_LEFT:
                    if (pressed) {
                        if (ev->modifiers & SAPP_MODIFIER_ALT) {
                            push_key(KEY_STRAFE_L, true);
                        }
                        else {
                            push_key(KEY_LEFTARROW, true);
                        }
                    }
                    else {
                        push_key(KEY_STRAFE_L, false);
                        push_key(KEY_LEFTARROW, false);
                    }
                    break;
                case SAPP_KEYCODE_RIGHT:
                    if (pressed) {
                        if (ev->modifiers & SAPP_MODIFIER_ALT) {
                            push_key(KEY_STRAFE_R, true);
                        }
                        else {
                            push_key(KEY_RIGHTARROW, true);
                        }
                    }
                    else {
                        push_key(KEY_STRAFE_R, false);
                        push_key(KEY_RIGHTARROW, false);
                    }
                    break;
                case SAPP_KEYCODE_A:
                    push_key(KEY_STRAFE_L, pressed);
                    break;
                case SAPP_KEYCODE_D:
                    push_key(KEY_STRAFE_R, pressed);
                    break;
                case SAPP_KEYCODE_SPACE:
                    push_key(KEY_USE, pressed);
                    break;
                case SAPP_KEYCODE_LEFT_CONTROL:
                    push_key(KEY_FIRE, pressed);
                    break;
                case SAPP_KEYCODE_ESCAPE:
                    push_key(KEY_ESCAPE, pressed);
                    break;
                case SAPP_KEYCODE_ENTER:
                    push_key(KEY_ENTER, pressed);
                    break;
                case SAPP_KEYCODE_TAB:
                    push_key(KEY_TAB, pressed);
                    break;
                case SAPP_KEYCODE_LEFT_SHIFT:
                case SAPP_KEYCODE_RIGHT_SHIFT:
                    push_key(KEY_RSHIFT, pressed);
                    break;
                case SAPP_KEYCODE_1:
                    push_key('1', pressed);
                    break;
                case SAPP_KEYCODE_2:
                    push_key('2', pressed);
                    break;
                case SAPP_KEYCODE_3:
                    push_key('3', pressed);
                    break;
                case SAPP_KEYCODE_4:
                    push_key('4', pressed);
                    break;
                case SAPP_KEYCODE_5:
                    push_key('5', pressed);
                    break;
                case SAPP_KEYCODE_6:
                    push_key('6', pressed);
                    break;
                case SAPP_KEYCODE_7:
                    push_key('7', pressed);
                    break;
                default:
                    consume_event = false;
                    break;
            }
            if (consume_event) {
                sapp_consume_event();
            }
        }
        else if (ev->type == SAPP_EVENTTYPE_MOUSE_DOWN) {
            app.inp.mouse_button_state |= (1<<ev->mouse_button);
            D_PostEvent(&(event_t){
                .type = ev_mouse,
                .data1 = app.inp.mouse_button_state,
            });
        }
        else if (ev->type == SAPP_EVENTTYPE_MOUSE_UP) {
            // delay mouse up to the next frame so that short
            // taps on touch pads are registered
            app.inp.delayed_mouse_button_up |= (1<<ev->mouse_button);
        }
        else if (ev->type == SAPP_EVENTTYPE_MOUSE_MOVE) {
            D_PostEvent(&(event_t){
                .type = ev_mouse,
                .data1 = app.inp.mouse_button_state,
                .data2 = AccelerateMouse(ev->mouse_dx),
            });
        }
    }
}

sapp_desc sokol_main(int argc, char* argv[]) {
    (void)argc;
    (void)argv;
    static char* args[] = { "doom", "-iwad", "DOOM1.WAD" };
    myargc = 3;
    myargv = args;
    return (sapp_desc){
        .init_cb = init,
        .frame_cb = frame,
        .cleanup_cb = cleanup,
        .event_cb = input,
        .width = SCREENWIDTH * 3,
        .height = SCREENHEIGHT * 3,
        .window_title = "Doom (shareware) on Sokol",
        .icon.sokol_default = true,
        .logger.func = slog_func,
    };
}

//== DoomGeneric backend callbacks =============================================

// Note that some of those are empty, because they only make sense
// in an "own the game loop" scenario, not in a frame-callback scenario.

void DG_Init(void) {
    // initialize sound font
    assert(app.data.sf.size > 0);
    app.music.sound_font = tsf_load_memory(app.data.sf.buf, app.data.sf.size);
    tsf_set_output(app.music.sound_font, TSF_STEREO_INTERLEAVED, saudio_sample_rate(), 0);
}

void DG_DrawFrame(void) {
    // empty, see sokol-app frame() callback instead
}

void DG_SetWindowTitle(const char* title) {
    // window title changes ignored
    (void)title;
}

int DG_GetKey(int* pressed, unsigned char* doomKey) {
    key_state_t key_state = pull_key();
    if (key_state.key_code != 0) {
        *doomKey = key_state.key_code;
        *pressed = key_state.pressed ? 1 : 0;
        return 1;
    }
    else {
        // no key available
        return 0;
    }
}

// the sleep function is used in blocking wait loops, those don't
// work in a browser environment anyway, inject an assert instead
// so we easily find all those wait loops
void DG_SleepMs(uint32_t ms) {
    assert(false && "DG_SleepMS called!\n");
}

// NOTE: game loop timing is done entirely through the frame callback,
// the DG_GetTicksMs() function is now only called from the
// menu input handling code for mouse and joystick, where timing
// doesn't matter.
uint32_t DG_GetTicksMs(void) {
    return 0;
}

//== FILE SYSTEM OVERRIDE ======================================================
#include "m_misc.h"
#include "w_file.h"
#include "z_zone.h"
#include "memio.h"

typedef struct
{
    wad_file_t wad;
    MEMFILE *fstream;
} memio_wad_file_t;

// at end of file!
extern wad_file_class_t memio_wad_file;

static wad_file_t* memio_OpenFile(char* path) {
    if (0 != strcmp(path, "DOOM1.WAD")) {
        return 0;
    }
    assert(app.data.wad.size > 0);
    MEMFILE* fstream = mem_fopen_read(app.data.wad.buf, app.data.wad.size);
    if (fstream == 0) {
        return 0;
    }

    memio_wad_file_t* result = Z_Malloc(sizeof(memio_wad_file_t), PU_STATIC, 0);
    result->wad.file_class = &memio_wad_file;
    result->wad.mapped = NULL;
    result->wad.length = app.data.wad.size;
    result->fstream = fstream;

    return &result->wad;
}

static void memio_CloseFile(wad_file_t* wad) {
    memio_wad_file_t* memio_wad = (memio_wad_file_t*) wad;
    mem_fclose(memio_wad->fstream);
    Z_Free(memio_wad);
}

static size_t memio_Read(wad_file_t* wad, uint32_t offset, void* buffer, size_t buffer_len) {
    memio_wad_file_t* memio_wad = (memio_wad_file_t*) wad;
    mem_fseek(memio_wad->fstream, offset, MEM_SEEK_SET);
    return mem_fread(buffer, 1, buffer_len, memio_wad->fstream);
}

wad_file_class_t memio_wad_file = {
    .OpenFile = memio_OpenFile,
    .CloseFile = memio_CloseFile,
    .Read = memio_Read,
};

/*== SOUND SUPPORT ===========================================================*/

// see https://github.com/mattiasgustavsson/doom-crt/blob/main/linuxdoom-1.10/i_sound.c

// helper function to load sound data from WAD lump
static void* snd_getsfx(const char* sfxname, int* len) {
    char name[20];
    snprintf(name, sizeof(name), "ds%s", sfxname);
    int sfxlump;
    if (W_CheckNumForName(name) == -1) {
        sfxlump = W_GetNumForName("dspistol");
    }
    else {
        sfxlump = W_GetNumForName(name);
    }
    const int size = W_LumpLength(sfxlump);
    assert(size > 8);

    uint8_t* sfx = W_CacheLumpNum(sfxlump, PU_STATIC);
    *len = size - 8;
    return sfx + 8;
}

// This function adds a sound to the list of currently active sounds,
// which is maintained as a given number (eight, usually) of internal channels.
// Returns a handle.
//
static int snd_addsfx(int sfxid, int slot, int volume, int separation) {
    assert((slot >= 0) && (slot < NUM_CHANNELS));
    assert((sfxid >= 0) && (sfxid < NUMSFX));

    /* SOKOL CHANGE: this doesn't seem to be necessary unless the
       sound playback is in an extern process (like fbDoom's sndserv)

    // Chainsaw troubles.
    // Play these sound effects only one at a time.
    if ((sfxid == sfx_sawup) ||
        (sfxid == sfx_sawidl) ||
        (sfxid == sfx_sawful) ||
        (sfxid == sfx_sawhit) ||
        (sfxid == sfx_stnmov) ||
        (sfxid == sfx_pistol))
    {
        for (int i = 0; i < NUM_CHANNELS; i++) {
            if (app.sound.channels[i].sfxid == sfxid) {
                // reset
                app.sound.channels[i] = (snd_channel_t){0};
                // we are sure that if, there will be only one
                break;
            }
        }
    }
    */
    app.sound.channels[slot].sfxid = sfxid;
    app.sound.cur_sfx_handle += 1;
    // on wraparound skip the 'invalid handle' 0
    if (app.sound.cur_sfx_handle == 0) {
        app.sound.cur_sfx_handle = 1;
    }
    app.sound.channels[slot].handle = (int)app.sound.cur_sfx_handle;
    app.sound.channels[slot].cur_ptr = S_sfx[sfxid].driver_data;
    app.sound.channels[slot].end_ptr = app.sound.channels[slot].cur_ptr + app.sound.lengths[sfxid];

    // Separation, that is, orientation/stereo. range is: 1 - 256
    separation += 1;

    // Per left/right channel.
    //  x^2 seperation,
    //  adjust volume properly.
    int left_sep = separation + 1;
    int leftvol = volume - ((volume * left_sep * left_sep) >> 16);
    assert((leftvol >= 0) && (leftvol <= 127));
    int right_sep = separation - 256;
    int rightvol = volume - ((volume * right_sep * right_sep) >> 16);
    assert((rightvol >= 0) && (rightvol <= 127));

    app.sound.channels[slot].leftvol = leftvol;
    app.sound.channels[slot].rightvol = rightvol;

    return app.sound.channels[slot].handle;
}

static float snd_clampf(float val, float maxval, float minval) {
    if (val > maxval) {
        return maxval;
    }
    else if (val < minval) {
        return minval;
    }
    else {
        return val;
    }
}

// mix active sound channels into the mixing buffer
static void snd_mix(int num_frames) {
    for (int frame_index = 0; frame_index < num_frames; frame_index++) {
        // downsampling: compute new left/right sample?
        if (app.sound.resample_accum >= app.sound.resample_outhz) {
            app.sound.resample_accum -= app.sound.resample_outhz;
            int dl = 0;
            int dr = 0;
            for (int slot = 0; slot < NUM_CHANNELS; slot++) {
                snd_channel_t* chn = &app.sound.channels[slot];
                if (chn->cur_ptr) {
                    int sample = ((int)(*chn->cur_ptr++)) - 128;
                    dl += sample * chn->leftvol;
                    dr += sample * chn->rightvol;
                    // sound effect done?
                    if (chn->cur_ptr >= chn->end_ptr) {
                        *chn = (snd_channel_t){0};
                    }
                }
            }
            app.sound.cur_left_sample = snd_clampf(((float)dl) / 16383.0f, 1.0f, -1.0f);
            app.sound.cur_right_sample = snd_clampf(((float)dr) / 16383.0f, 1.0f, -1.0f);
        }
        app.sound.resample_accum += app.sound.resample_inhz;

        // write left and right sample values to mix buffer
        app.sound.mixbuffer[frame_index*2]     = app.sound.cur_left_sample;
        app.sound.mixbuffer[frame_index*2 + 1] = app.sound.cur_right_sample;
    }
}

static boolean snd_Init(boolean use_sfx_prefix) {
    assert(use_sfx_prefix);
    app.sound.use_sfx_prefix = use_sfx_prefix;
    assert(app.sound.use_sfx_prefix);
    app.sound.resample_outhz = app.sound.resample_accum = saudio_sample_rate();
    app.sound.resample_inhz = 11025;    // sound effect are in 11025Hz
    return true;
}

static void snd_Shutdown(void) {
    // nothing to do here
}

static int snd_GetSfxLumpNum(sfxinfo_t* sfx) {
    char namebuf[20];
    if (app.sound.use_sfx_prefix) {
        M_snprintf(namebuf, sizeof(namebuf), "dp%s", sfx->name);
    }
    else {
        M_StringCopy(namebuf, sfx->name, sizeof(namebuf));
    }
    return W_GetNumForName(namebuf);
}

static void snd_Update(void) {
    // sound mixing and pushing to sokol-audio happens in the frame()
    // callback at display refresh rate
}

static void snd_UpdateSoundParams(int handle, int vol, int sep) {
    // FIXME
}

// Starts a sound in a particular sound channel.
//
// Starting a sound means adding it
//  to the current list of active sounds
//  in the internal channels.
// As the SFX info struct contains
//  e.g. a pointer to the raw data,
//  it is ignored.
// As our sound handling does not handle
//  priority, it is ignored.
// Pitching (that is, increased speed of playback)
//  is set, but currently not used by mixing.
//
static int snd_StartSound(sfxinfo_t* sfxinfo, int channel, int vol, int sep) {
    int sfxid = sfxinfo - S_sfx;
    assert((sfxid >= 0) && (sfxid < NUMSFX));
    int handle = snd_addsfx(sfxid, channel, vol, sep);
    return handle;
}

static void snd_StopSound(int handle) {
    for (int i = 0; i < NUM_CHANNELS; i++) {
        if (app.sound.channels[i].handle == handle) {
            app.sound.channels[i] = (snd_channel_t){0};
        }
    }
}

static boolean snd_SoundIsPlaying(int handle) {
    for (int i = 0; i < NUM_CHANNELS; i++) {
        if (app.sound.channels[i].handle == handle) {
            return true;
        }
    }
    return false;
}

static void snd_CacheSounds(sfxinfo_t* sounds, int num_sounds) {
    for (int i = 0; i < num_sounds; i++) {
        if (0 == sounds[i].link) {
            // load data from WAD file
            sounds[i].driver_data = snd_getsfx(sounds[i].name, &app.sound.lengths[i]);
        }
        else {
            // previously loaded already?
            const int snd_index = sounds[i].link - sounds;
            assert((snd_index >= 0) && (snd_index < NUMSFX));
            sounds[i].driver_data = sounds[i].link->driver_data;
            app.sound.lengths[i] = app.sound.lengths[snd_index];
        }
    }
}

static snddevice_t sound_sokol_devices[] = {
    SNDDEVICE_SB,
    /* SOKOL CHANGE
    SNDDEVICE_PAS,
    SNDDEVICE_GUS,
    SNDDEVICE_WAVEBLASTER,
    SNDDEVICE_SOUNDCANVAS,
    SNDDEVICE_AWE32,
    */
};

sound_module_t sound_sokol_module = {
    .sound_devices = sound_sokol_devices,
    .num_sound_devices = arrlen(sound_sokol_devices),
    .Init = snd_Init,
    .Shutdown = snd_Shutdown,
    .GetSfxLumpNum = snd_GetSfxLumpNum,
    .Update = snd_Update,
    .UpdateSoundParams = snd_UpdateSoundParams,
    .StartSound = snd_StartSound,
    .StopSound = snd_StopSound,
    .SoundIsPlaying = snd_SoundIsPlaying,
    .CacheSounds = snd_CacheSounds,
};

/*== MUSIC SUPPORT ===========================================================*/

// see: https://github.com/mattiasgustavsson/doom-crt/blob/f5108fe122fa9c2a334a0ae387d36ddbabc5bf1a/linuxdoom-1.10/i_sound.c#L576
static void mus_mix(int num_frames) {
    mus_t* mus = app.music.mus;
    if (!mus) {
        return;
    }
    tsf* sf = app.music.sound_font;
    assert(sf);
    if (app.music.reset) {
        tsf_reset(sf);
        app.music.reset = false;
    }
    tsf_set_volume(sf, app.music.volume);
    int leftover_from_previous = app.music.leftover;
    int remaining = num_frames;
    float* output = app.sound.mixbuffer;
    int leftover = 0;
    if (leftover_from_previous > 0) {
        int count = leftover_from_previous;
        if (count > remaining) {
            leftover = count - remaining;
            count = remaining;
        }
        tsf_render_float(sf, output, count, 1);
        remaining -= count;
        output += count * 2;
    }
    if (leftover > 0) {
        app.music.leftover = leftover;
        return;
    }

    while (remaining) {
        mus_event_t ev;
        mus_next_event(app.music.mus, &ev);
        switch (ev.cmd) {
            case MUS_CMD_RELEASE_NOTE:
                tsf_channel_note_off(sf, ev.channel, ev.data.release_note.note);
                break;
            case MUS_CMD_PLAY_NOTE:
                tsf_channel_note_on(sf, ev.channel, ev.data.play_note.note, ev.data.play_note.volume / 127.0f);
                break;
            case MUS_CMD_PITCH_BEND: {
                int pitch_bend = (ev.data.pitch_bend.bend_amount - 128) * 64 + 8192;
                tsf_channel_set_pitchwheel(sf, ev.channel, pitch_bend);
            } break;
            case MUS_CMD_SYSTEM_EVENT:
                switch (ev.data.system_event.event) {
                    case MUS_SYSTEM_EVENT_ALL_SOUNDS_OFF:
                        tsf_channel_sounds_off_all(sf, ev.channel);
                        break;
                    case MUS_SYSTEM_EVENT_ALL_NOTES_OFF:
                        tsf_channel_note_off_all(sf, ev.channel);
                        break;
                    case MUS_SYSTEM_EVENT_MONO:
                    case MUS_SYSTEM_EVENT_POLY:
                        // not supported
                        break;
                    case MUS_SYSTEM_EVENT_RESET_ALL_CONTROLLERS:
                        tsf_channel_midi_control(sf, ev.channel, 121, 0);
                        break;
                }
                break;
            case MUS_CMD_CONTROLLER: {
                int value = ev.data.controller.value;
                switch (ev.data.controller.controller) {
                    case MUS_CONTROLLER_CHANGE_INSTRUMENT:
                        if (ev.channel == 15) {
                            tsf_channel_set_presetnumber(sf, 15, 0, 1);
                        }
                        else {
                            tsf_channel_set_presetnumber(sf, ev.channel, value, 0);
                        }
                        break;
                    case MUS_CONTROLLER_BANK_SELECT:
                        tsf_channel_set_bank(sf, ev.channel, value);
                        break;
                    case MUS_CONTROLLER_VOLUME:
                        tsf_channel_midi_control(sf, ev.channel, 7, value);
                        break;
                    case MUS_CONTROLLER_PAN:
                        tsf_channel_midi_control(sf, ev.channel, 10, value);
                        break;
                    case MUS_CONTROLLER_EXPRESSION:
                        tsf_channel_midi_control(sf, ev.channel, 11, value);
                        break;
                    case MUS_CONTROLLER_MODULATION:
                    case MUS_CONTROLLER_REVERB_DEPTH:
                    case MUS_CONTROLLER_CHORUS_DEPTH:
                    case MUS_CONTROLLER_SUSTAIN_PEDAL:
                    case MUS_CONTROLLER_SOFT_PEDAL:
                        break;
                }
            } break;
            case MUS_CMD_END_OF_MEASURE:
                // not used
                break;
            case MUS_CMD_FINISH:
                mus_restart(mus);
                break;
            case MUS_CMD_RENDER_SAMPLES: {
                int count = ev.data.render_samples.samples_count;
                if (count > remaining) {
                    leftover = count - remaining;
                    count = remaining;
                }
                tsf_render_float(sf, output, count, 1);
                remaining -= count;
                output += count * 2;
            } break;
        }
    }
    app.music.leftover = leftover;
}

static boolean mus_Init(void) {
    app.music.reset = true;
    app.music.volume = 7;
    return true;
}

static void mus_Shutdown(void) {
    if (app.music.mus) {
        mus_destroy(app.music.mus);
        app.music.mus = 0;
    }
}

static void mus_SetMusicVolume(int volume) {
    app.music.volume = ((float)volume / 64.0f);
}

static void mus_PauseMusic(void) {
    // FIXME
}

static void mus_ResumeMusic(void) {
    // FIXME
}

static void* mus_RegisterSong(void* data, int len) {
    app.music.cur_song_data = data;
    app.music.cur_song_len = len;
    return 0;
}

static void mus_UnRegisterSong(void* handle) {
    app.music.cur_song_data = 0;
    app.music.cur_song_len = 0;
}

static void mus_PlaySong(void* handle, boolean looping) {
    if (app.music.mus) {
        mus_destroy(app.music.mus);
        app.music.mus = 0;
    }
    assert(app.music.cur_song_data);
    assert(app.music.cur_song_len == *(((uint16_t*)app.music.cur_song_data)+2 ) + *(((uint16_t*)app.music.cur_song_data)+3));
    app.music.mus = mus_create(app.music.cur_song_data, app.music.cur_song_len, 0);
    assert(app.music.mus);
    app.music.leftover = 0;
    app.music.reset = true;
}

static void mus_StopSong(void) {
    assert(app.music.mus);
    mus_destroy(app.music.mus);
    app.music.mus = 0;
    app.music.leftover = 0;
    app.music.reset = true;
}

static boolean mus_MusicIsPlaying(void) {
    // never called
    return false;
}

static void mus_Poll(void) {
    // empty, see update_game_audio() instead
}

static snddevice_t music_sokol_devices[] = {
/* SOKOL CHANGE
    SNDDEVICE_PAS,
    SNDDEVICE_GUS,
    SNDDEVICE_WAVEBLASTER,
    SNDDEVICE_SOUNDCANVAS,
    SNDDEVICE_GENMIDI,
*/
    SNDDEVICE_AWE32,
};

music_module_t music_sokol_module = {
    .sound_devices = music_sokol_devices,
    .num_sound_devices = arrlen(music_sokol_devices),
    .Init = mus_Init,
    .Shutdown = mus_Shutdown,
    .SetMusicVolume = mus_SetMusicVolume,
    .PauseMusic = mus_PauseMusic,
    .ResumeMusic = mus_ResumeMusic,
    .RegisterSong = mus_RegisterSong,
    .UnRegisterSong = mus_UnRegisterSong,
    .PlaySong = mus_PlaySong,
    .StopSong = mus_StopSong,
    .MusicIsPlaying = mus_MusicIsPlaying,
    .Poll = mus_Poll,
};
