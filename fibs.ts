import {
    Builder,
    Configurer,
    main,
} from "https://raw.githubusercontent.com/floooh/fibs/master/index.ts";
main(import.meta);

export function configure(c: Configurer) {
    c.addImport({
        name: "libs",
        url: "https://github.com/floooh/fibs-libs",
        files: ["sokol.ts"],
    });
    c.addImport({
        name: "platforms",
        url: "https://github.com/floooh/fibs-platforms",
        files: ["emscripten.ts"],
    });
    c.addImport({
        name: "utils",
        url: "https://github.com/floooh/fibs-utils",
        files: ["stdoptions.ts", "copyfiles.ts", "sokolshdc.ts"],
    });
}

export function build(b: Builder) {
    // a little helper library to obtain the macos app resource path
    b.addTarget("fileutil", "lib", (t) => {
        t.setDir('src/fileutil');
        if (b.isMacOS()) {
            t.addSource('fileutil_osx.m');
        } else {
            t.addSource('fileutil.c');
        }
    });

    // the actual doom executable
    b.addTarget("doom", "windowed-exe", (t) => {
        const shdcOutDir = b.targetBuildDir(t.name());
        t.setDir("src");
        t.addSources(sources);
        t.addDependencies(["sokol", "fileutil"]);
        t.addJob({
            job: "copyfiles",
            args: {
                files: ["doom1.wad.wasm", "aweromgm.sf2.wasm"],
            },
        });
        t.addJob({
            job: "sokolshdc",
            args: { src: "sokol_shaders.glsl", outDir: shdcOutDir },
        });
        t.addIncludeDirectories([shdcOutDir]);
        if (b.isGcc() || b.isClang()) {
            t.addCompileOptions([
                "-Wno-unknown-warning-option",
                "-Wno-sign-compare",
                "-Wno-unused-parameter",
                "-Wno-unused-const-variable",
                "-Wno-unused-but-set-parameter",
                "-Wno-unused-but-set-variable",
                "-Wno-absolute-value",
                "-Wno-null-pointer-subtraction",
                "-Wno-pointer-to-int-cast",
            ]);
        }
        if (b.isGcc()) {
            t.addCompileOptions([
                "-Wno-implicit-fallthrough",
                "-Wno-enum-conversion",
                "-Wno-format-truncation",
                "-Wno-type-limits",
            ]);
        }
        if (b.isMsvc()) {
            t.addCompileOptions([
                "/wd4244",
                "/wd4267", // conversion from 'xxx' to 'yyy' possible loss of data
                "/wd4146", // unary minus perator applied to unsigned type, result still unsigned
                "/wd4018", // signed/unsigned mismatch
                "/wd4996", // ...deprecated...
                "/wd4311", // pointer trunction from 'xxx' to 'yyy'
            ]);
        }
    });
}

const sources = [
    "sokol.c",
    "doomgeneric_sokol.c",
    "dummy.c",
    "am_map.c",
    "doomdef.c",
    "doomstat.c",
    "dstrings.c",
    "d_event.c",
    "d_items.c",
    "d_iwad.c",
    "d_loop.c",
    "d_main.c",
    "d_mode.c",
    "d_net.c",
    "f_finale.c",
    "f_wipe.c",
    "g_game.c",
    "hu_lib.c",
    "hu_stuff.c",
    "info.c",
    "i_cdmus.c",
    "i_endoom.c",
    "i_joystick.c",
    "i_scale.c",
    "i_sound.c",
    "i_system.c",
    "i_timer.c",
    "memio.c",
    "m_argv.c",
    "m_bbox.c",
    "m_cheat.c",
    "m_config.c",
    "m_controls.c",
    "m_fixed.c",
    "m_menu.c",
    "m_misc.c",
    "m_random.c",
    "p_ceilng.c",
    "p_doors.c",
    "p_enemy.c",
    "p_floor.c",
    "p_inter.c",
    "p_lights.c",
    "p_map.c",
    "p_maputl.c",
    "p_mobj.c",
    "p_plats.c",
    "p_pspr.c",
    "p_saveg.c",
    "p_setup.c",
    "p_sight.c",
    "p_spec.c",
    "p_switch.c",
    "p_telept.c",
    "p_tick.c",
    "p_user.c",
    "r_bsp.c",
    "r_data.c",
    "r_draw.c",
    "r_main.c",
    "r_plane.c",
    "r_segs.c",
    "r_sky.c",
    "r_things.c",
    "sha1.c",
    "sounds.c",
    "statdump.c",
    "st_lib.c",
    "st_stuff.c",
    "s_sound.c",
    "tables.c",
    "v_video.c",
    "wi_stuff.c",
    "w_checksum.c",
    "w_file.c",
    "w_main.c",
    "w_wad.c",
    "z_zone.c",
    "i_input.c",
    "i_video.c",
    "doomgeneric.c",
];
