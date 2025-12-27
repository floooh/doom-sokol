# Doom on Sokol

This is a port of the Doom shareware version to the cross-platform [Sokol headers](https://github.com/floooh/sokol).

Web version: https://floooh.github.io/doom-sokol/

Forked from https://github.com/ozkl/doomgeneric

Also uses:

- TinySoundFont by Bernhard Schelling: https://github.com/schellingb/TinySoundFont
- MUS support by Mattias Gustavsson: https://github.com/mattiasgustavsson/doom-crt/blob/main/libs_win32/mus.h

# How to build

Prerequisites:

- cmake 3.21+
- deno 2.6+ (https://docs.deno.com/runtime/getting_started/installation/)
- on Windows: a somewhat recent Visual Studio version
- on macOS: a somewhat recent Xcode version and command line tools
- on Linux, for VSCode support and for the WASM build: ninja
- on Linux: X11, OpenGL and ALSA development packages

Clone, build and run:

```sh
git clone https://github.com/floooh/doom-sokol
cd doom-sokol
./fibs build
./fibs run doom
```

To open the project in Visual Studio, VSCode or Xcode configure
with one of the following build configs:
```sh
git clone https://github.com/floooh/doom-sokol
cd doom-sokol
# on Windows with Visual Studio:
./fibs config win-vstudio-debug
# on Windows with VSCode:
./fibs config win-vscode-debug
# on macOS with Xcode:
./fibs config macos-xcode-debug
# on macOS with VSCode:
./fibs config macos-vscode-debug
# on Linux with VSCode:
./fibs config linux-vscode-debug
# ...and open in the above IDE
./fibs open
```

To build the web version (in the doom-sokol directory):
```sh
./fibs emsdk install
./fibs config emsc-ninja-release
./fibs build
./fibs run doom
```

...or alternatively:
```sh
./fibs webpage build
./fibs webpage serve
```


# Porting Notes

The project has been forked from the [doomgeneric](https://github.com/ozkl/doomgeneric) project
which in turn is a fork of [fbDoom](https://github.com/maximevince/fbDOOM). Doomgeneric
adds callback functions for easier porting of the rendering-, input- and timing-code
to new platforms. This was very useful to get started but in the end didn't help
much because Doom (and Doomgeneric) depend on an "own the game loop" application model,
while sokol_app.h is built around a frame callback model which required some changes
in the Doom gameloop code itself. Eventually nearly all Doomgeneric callbacks ended
up as empty stubs, and it probably would have made more sense to start with
fbDoom, or even the original Doom source code.

The first step was to replace the main() function with the sokol_app.h
application entry and callback functions.

The original main() function is in [i_main.c](https://github.com/ozkl/doomgeneric/blob/master/doomgeneric/i_main.c), this source file has been removed completely. Instead the sokol_app.h entry function
is in [doomgeneric_sokol.c](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L684-L700), along with all other sokol-port-specific code.

After ```sokol_main()``` is called, execution continues at the
[init() callback](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L159). This first initializes all sokol libraries:

- [sokol_time.h](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L161) for measuring frame duration
- [sokol_gfx.h](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L162-L169) for rendering the Doom framebuffer via OpenGL, WebGL, D3D11 or Metal
- [sokol_debugtext.h](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L170-L173) for rendering a intro screen and data load progress  before the actual game starts
- [sokol_fetch.h](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L174-L178) for asynchronously loading data files (the Doom shareware WAD file, and a
soundfont needed for the sound track)
- [sokol_audio.h](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L179-L184) for streaming audio samples to WASAPI, ALSA, WebAudio or CoreAudio

Next, [sokol-gfx resource objects are created](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L186-L267) which are needed for rendering the Doom framebuffer (more on that later).

Next, [two asynchronous load operations are started](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L269-L284) to load the required data files (a WAD file and a soundfont file) into memory.

It's important to note that Doom itself isn't initialized yet, this is delayed until
all data has finished loading.

Finally the 'application state' is set to 'loading', which concludes the sokol_app.h
initialization function.

This is a good time to talk about the general application structure:

All sokol-port-specific state lives in a [single nested data structure](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L75-L129) which is only
accessible from within the doomgeneric_sokol.c source file.

The application goes through several states before running any actual
Doom code:

- The first state is ```LOADING```, this is active as long as the asynchronous
  data loading isn't finished. During the ```LOADING``` state, [an intro screen](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L316-L351) will be displayed, and a message that loading is in progress.
- For the unlikely case that [loading fails](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L139-L142), the application will switch into
  the ```LOADING_FAILED``` state. During the ```LOADING_FAILED``` state the
  same into screen will be displayed, but with the loading message replaced
  with an error message.
- Once [loading has successfully finished](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L132-L138), the application will switch into the
  ```WAITING``` state. This shows the usual intro screen and the message
  'Press any key to start game'.
- When [a key (or mouse button) is pressed](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L531-L538), the application will switch into the
  ```INIT``` state. This is where the actual [Doom initialization code](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L455-L460) runs, the application state switches to ```RUNNING```, and [this is finally](https://github.com/floooh/doom-sokol/blob/204ee61021e311695c038e4a7529531b98a58ebb/src/doomgeneric_sokol.c#L461-L477) where the actual game code runs frame after frame.

## Frame Slicing

The original Doom [main() function](https://github.com/id-Software/DOOM/blob/77735c3ff0772609e9c8d29e3ce2ab42ff54d20b/linuxdoom-1.10/i_main.c#L34-L45) calls the [D_DoomMain()](https://github.com/id-Software/DOOM/blob/77735c3ff0772609e9c8d29e3ce2ab42ff54d20b/linuxdoom-1.10/d_main.c#L793-L1171) which doesn't return until the game quits. [D_DoomMain()](https://github.com/id-Software/DOOM/blob/77735c3ff0772609e9c8d29e3ce2ab42ff54d20b/linuxdoom-1.10/d_main.c#L793-L1171) consists of a lot of initialization
code and finally calls the [D_DoomLoop()](https://github.com/id-Software/DOOM/blob/77735c3ff0772609e9c8d29e3ce2ab42ff54d20b/linuxdoom-1.10/d_main.c#L354-L407) function, which has a ```while (1) { ... }``` loop.

The doomgeneric [D_DoomLoop()](https://github.com/ozkl/doomgeneric/blob/2d9b24f07c78c36becf41d89db30fa99863463e5/doomgeneric/d_main.c#L408-L457) looks a bit different but also has the infinite while loop at the end.

The actually important function within the while loop is [TryRunTics()](https://github.com/ozkl/doomgeneric/blob/2d9b24f07c78c36becf41d89db30fa99863463e5/doomgeneric/d_loop.c#L706-L821) which has a tricky [nested waiting loop](https://github.com/ozkl/doomgeneric/blob/2d9b24f07c78c36becf41d89db30fa99863463e5/doomgeneric/d_loop.c#L767-L785).

And finally there's another ugly doubly-nested loop at the end of the [D_Display() function](https://github.com/ozkl/doomgeneric/blob/2d9b24f07c78c36becf41d89db30fa99863463e5/doomgeneric/d_main.c#L313-L328) which performs the screen transition
'wipe' effect.

Those nested loops are all bad for a frame callback application model which is throttled by
the vsync instead of explict busy loops and need to be 'sliced' into per-frame code.

Let's start at the top:

- The top level ```while (1) { ... }``` loop in the ```D_DoomLoop()``` function has been [removed](https://github.com/floooh/doom-sokol/blob/b2d24da87d7fcc2646cf7a8bdcb2371954fb6c36/src/d_main.c#L434-L450) and moved into a new [D_DoomFrame()](https://github.com/floooh/doom-sokol/blob/b2d24da87d7fcc2646cf7a8bdcb2371954fb6c36/src/d_main.c#L453-L467) function.

- The [TryRunTics() function](https://github.com/floooh/doom-sokol/blob/7f7a6777dc15b4553f68423e6eb3bcda1a898167/src/d_loop.c#L714-L842) has been gutted so that it always runs one game tick per invocation and no longer attempts to adjust the number of executed game tics to
the wall clock time.

- The [D_Display() function](https://github.com/floooh/doom-sokol/blob/b2d24da87d7fcc2646cf7a8bdcb2371954fb6c36/src/d_main.c#L166-L180) has been turned into a simple state machine which either renders
a screen-wipe-frame or a regular frame.

These 3 hacks were enough to make Doom run within the frame callback application model.

Game tick timing now happens [at the top in the sokol_app.h frame callback](https://github.com/floooh/doom-sokol/blob/32cc2ecf1bbabd7462dfbf57c9d978a9ed18b6e4/src/doomgeneric_sokol.c#L439-L447), and
this is were I accepted a little compromise. The original Doom runs at a fixed
35Hz game tick rate (probably because 70Hz was a typical VGA display refresh
rate in the mid-90s). Instead of trying to force the game to a 35Hz tick rate
and accept slight stuttering because of skipped game tics on displays refresh
rates that are not a multiple of 35Hz I allow the game to run slightly slow or
fast, but never skip a display frame to guarantee a smooth frame rate. For
instance on a 60Hz, 120Hz or 240Hz monitor the game will run slightly slow at a
30Hz game tick rate, while on an 80Hz monitor it will run slightly fast at 40Hz.
Only on a 70Hz or 140Hz display it will run exactly right at 35Hz game tick
rate.

## File IO and WAD loading

There's a *lot* of not really relevant file IO in the original Doom code base for WAD file
discovery, configuration files, savegames and some other unimportant things which I simply
commented out or disabled otherwise.

The only really relevant file IO code is reading data from a single WAD file. This
has been ported by first loading a WAD file asynchronously into memory before the
game starts, and then replacing the C-runtime file IO functions with equivalent
functions that work on a memory buffer instead of a filesystem file.

Interestingly, the Doom codebase already includes such a ["memory filesystem" here](https://github.com/floooh/doom-sokol/blob/master/src/memio.c), but doesn't appear to use it.

All WAD file accesses are also already wrapped through a jump table interface
so that it was [quite trivial](https://github.com/floooh/doom-sokol/blob/58947ccf19214800b1f65d435afafe842caf30b8/src/doomgeneric_sokol.c#L751-L802) to redirect WAD data loading from the C file IO
functions to the already existing memio functions.

## Rendering

Doom renders to a VGA Mode 13h framebuffer: 320x200 pixels with one byte per pixel,
referencing a 256 entry color palette.

fbDoom [converts the Mode13 framebuffer into an RGBA framebuffer](https://github.com/maximevince/fbDOOM/blob/476a0cef4a3068015f85993bc916fca38bc2d970/fbdoom/i_video_fbdev.c#L134-L159) with 32 bits
per pixel, and doomgeneric replaces the [Linux framebuffer write](https://github.com/maximevince/fbDOOM/blob/476a0cef4a3068015f85993bc916fca38bc2d970/fbdoom/i_video_fbdev.c#L445-L446) with a [callback function](https://github.com/ozkl/doomgeneric/blob/2d9b24f07c78c36becf41d89db30fa99863463e5/doomgeneric/i_video.c#L294).

In the Sokol port I'm skipping all the additional code in fbDoom and doomgeneric, and
use sokol_gfx.h for the color palette lookup and rendering the resulting RGBA8
texture to the display.

Rendering is performed in two sokol_gfx.h render passes:

- first the Doom framebuffer and current color palette are [copied into dynamic
textures](https://github.com/floooh/doom-sokol/blob/58947ccf19214800b1f65d435afafe842caf30b8/src/doomgeneric_sokol.c#L377-L389)
- next an [offscreen render pass](https://github.com/floooh/doom-sokol/blob/58947ccf19214800b1f65d435afafe842caf30b8/src/doomgeneric_sokol.c#L391-L403) performs the color palette lookup into a 320x200 RGBA8 texture
using the [following pixel shader code](https://github.com/floooh/doom-sokol/blob/58947ccf19214800b1f65d435afafe842caf30b8/src/sokol_shaders.glsl#L14-L22)
- finally the resulting 320x200 RGBA8 texture is [rendered to the display](https://github.com/floooh/doom-sokol/blob/58947ccf19214800b1f65d435afafe842caf30b8/src/doomgeneric_sokol.c#L405-L421) with the [correct aspect ratio](https://github.com/floooh/doom-sokol/blob/58947ccf19214800b1f65d435afafe842caf30b8/src/doomgeneric_sokol.c#L353-L373), this second render step
happens with linear texture filtering so that the upscaled image looks a bit smoother

## Sound

Sound support is split into two areas:

- sound effects which are stored as 11025 Hz samples in the WAD file
- background music which is stored in a custom MIDI-like format called 'MUS' in the
WAD file which originally required a sound card with sample banks in ROM to play

Doomgeneric simply [ignores sound support](https://github.com/ozkl/doomgeneric/blob/2d9b24f07c78c36becf41d89db30fa99863463e5/doomgeneric/doomfeatures.h#L34-L36), and fbDOOM and the original
Linux DOOM implement sound effect support [in a separate process](https://github.com/maximevince/fbDOOM/tree/master/sndserv), but I haven't found any signs of background music support there (but I haven't
looked too hard either).

Mattias Gustavsson's [doom-crt](https://github.com/mattiasgustavsson/doom-crt/) to the rescue!

Doom-crt implements proper background music support through a [MUS parser](https://github.com/mattiasgustavsson/doom-crt/blob/main/libs_win32/mus.h) written by Mattias, and the [TinySoundFont library](https://github.com/schellingb/TinySoundFont) by Bernhard Schelling.

This is how sound support is implemented in Doom-Sokol:

- at the lowest level, [sokol_audio.h](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L179-L184) takes care of forwarding a stream of
stereo-samples to the platform-specific audio backend (WebAudio, WASAPI, CoreAudio
or ALSA)
- sound effects are handled by a [sound module](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L1025-L1037) which is basically
a collection of callback functions
- likewise, music is handled by a [music module](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L1233-L1247)

When the Doom code needs to play a sound effect or start a new song, it will call
one of the callback functions of the sound- or music-module.

The core of the sound effect code are the two functions [snd_addsfx()](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L826-L883) and [snd_mix()](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L897-L926).

The ```snd_addsfx()``` function is called when Doom needs to start a new sound effect.
This will simply register the sound effect's wave table with a free voice channel.
Finding a free voice channel (or stealing an occupied channel) already happened
in Doom's [generic sound effect code](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/s_sound.c#L456-L457).

The function ```snd_mix()``` then simply needs to mix the active sound effects
of all voice channels [into a stereo sample stream](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L897-L926).

Music support starts with [loading a 'sound font' into memory](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L279-L284) and registering it
[with the tinysoundfont library](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L708-L711).

Everything else is handled in the music module callback functions.

When Doom wants to start a new music track it first calls the [RegisterSong callback](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L1181-L1185), this simply
stores a pointer and size to the MUS file data stored in memory.

Next the callback [PlaySong](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L1192-L1203) is called. This registers the song data with the ```mus.h``` library.

Everything else happens in the [mus_mix() function](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L1041-L1154) which plays the same
role as the ```snd_mix()``` function, but for music. Its task is to generate a stereo
sample stream by glueing the ```mus.h``` library which parses the MUS file data to the
TinySoundFont library which 'realizes' MUS events and 'renders' a sample stream which is
mixed into the previously generated sound effect sample stream.

The final missing piece of the sound code is the [update_game_audio() function](https://github.com/floooh/doom-sokol/blob/914fd54fe6724e822e4404a8f301b30ec419e8bd/src/doomgeneric_sokol.c#L426-L434). This is
called once per frame (not per game tick) by the sokol_app.h frame callback, generates the
required number of stereo samples for sound effects and music, and finally pushes the
generated stereo sample stream into sokol_audio.h for playback.
