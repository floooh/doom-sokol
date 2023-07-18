fips_begin_lib(sokol)
    fips_files(sokol.c)
    if (FIPS_OSX)
        fips_frameworks_osx(Cocoa QuartzCore Metal MetalKit AudioToolbox)
    elseif (FIPS_LINUX)
        fips_libs(X11 Xi Xcursor GL m dl asound)
    endif()
    if(FIPS_EMSCRIPTEN)
        target_compile_definitions(sokol PRIVATE SOKOL_GLES3)
        set(slang "glsl300es")
    elseif(FIPS_WINDOWS)
        target_compile_definitions(sokol PRIVATE SOKOL_D3D11)
        set(slang "hlsl4")
    elseif(FIPS_OSX)
        target_compile_options(sokol PRIVATE -x objective-c)
        target_compile_definitions(sokol PRIVATE SOKOL_METAL)
        set(slang "metal_macos")
    else()
        target_compile_definitions(sokol PRIVATE SOKOL_GLCORE33)
        set(slang "glsl330")
    endif()
fips_end_lib()

fips_begin_app(doom windowed)
    fips_files(
        doomgeneric_sokol.c
        dummy.c
        am_map.c
        doomdef.c
        doomstat.c
        dstrings.c
        d_event.c
        d_items.c
        d_iwad.c
        d_loop.c
        d_main.c
        d_mode.c
        d_net.c
        f_finale.c
        f_wipe.c
        g_game.c
        hu_lib.c
        hu_stuff.c
        info.c
        i_cdmus.c
        i_endoom.c
        i_joystick.c
        i_scale.c
        i_sound.c
        i_system.c
        i_timer.c
        memio.c
        m_argv.c
        m_bbox.c
        m_cheat.c
        m_config.c
        m_controls.c
        m_fixed.c
        m_menu.c
        m_misc.c
        m_random.c
        p_ceilng.c
        p_doors.c
        p_enemy.c
        p_floor.c
        p_inter.c
        p_lights.c
        p_map.c
        p_maputl.c
        p_mobj.c
        p_plats.c
        p_pspr.c
        p_saveg.c
        p_setup.c
        p_sight.c
        p_spec.c
        p_switch.c
        p_telept.c
        p_tick.c
        p_user.c
        r_bsp.c
        r_data.c
        r_draw.c
        r_main.c
        r_plane.c
        r_segs.c
        r_sky.c
        r_things.c
        sha1.c
        sounds.c
        statdump.c
        st_lib.c
        st_stuff.c
        s_sound.c
        tables.c
        v_video.c
        wi_stuff.c
        w_checksum.c
        w_file.c
        w_main.c
        w_wad.c
        z_zone.c
        i_input.c
        i_video.c
        doomgeneric.c
    )
    fips_deps(sokol)
    sokol_shader(sokol_shaders.glsl ${slang})
    fipsutil_copy(doom-assets.yml)
    if (FIPS_CLANG OR FIPS_GCC)
        target_compile_options(doom PRIVATE
            -Wno-unknown-warning-option
            -Wno-sign-compare
            -Wno-unused-parameter
            -Wno-unused-const-variable
            -Wno-unused-but-set-parameter
            -Wno-unused-but-set-variable
            -Wno-absolute-value
            -Wno-null-pointer-subtraction
            -Wno-pointer-to-int-cast
        )
    endif()
    if (FIPS_GCC)
        target_compile_options(doom PRIVATE
            -Wno-implicit-fallthrough
            -Wno-enum-conversion
            -Wno-format-truncation
            -Wno-type-limits
        )
    endif()
    if (FIPS_MSVC)
        target_compile_options(doom PRIVATE
            /wd4244 /wd4267     # conversion from 'xxx' to 'yyy' possible loss of data
            /wd4146             # unary minus perator applied to unsigned type, result still unsigned
            /wd4018             # signed/unsigned mismatch
            /wd4996             # ...deprecated...
            /wd4311             # pointer trunction from 'xxx' to 'yyy'
        )
    endif()
fips_end_app()
