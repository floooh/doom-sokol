import os, yaml, shutil, subprocess, glob
from mod import log, util, project

BuildConfig = 'wasm-ninja-release'

#-------------------------------------------------------------------------------
def build_deploy_webpage(fips_dir, proj_dir):
    ws_dir = util.get_workspace_dir(fips_dir)
    webpage_dir = '{}/fips-deploy/doom-sokol-webpage'.format(ws_dir)
    if not os.path.isdir(webpage_dir) :
        os.makedirs(webpage_dir)

    project.gen(fips_dir, proj_dir, BuildConfig)
    project.build(fips_dir, proj_dir, BuildConfig)

    src_dir = '{}/fips-deploy/doom-sokol/{}'.format(ws_dir, BuildConfig)
    dst_dir = webpage_dir

    shutil.copy(src_dir+'/doom.html', dst_dir+'/index.html')
    shutil.copy(src_dir+'/doom.wasm', dst_dir+'/doom.wasm')
    shutil.copy(src_dir+'/doom.js', dst_dir+'/doom.js')
    shutil.copy(src_dir+'/doom1.wad.wasm', dst_dir+'/doom1.wad.wasm')
    shutil.copy(src_dir+'/aweromgm.sf2.wasm', dst_dir+'/aweromgm.sf2.wasm')

    log.colored(log.GREEN, 'Generated web page under {}.'.format(webpage_dir))

#-------------------------------------------------------------------------------
def serve_webpage(fips_dir, proj_dir) :
    ws_dir = util.get_workspace_dir(fips_dir)
    webpage_dir = '{}/fips-deploy/doom-sokol-webpage'.format(ws_dir)
    p = util.get_host_platform()
    if p == 'osx' :
        try :
            subprocess.call(
                'http-server -c-1 -g -o'.format(fips_dir),
                cwd = webpage_dir, shell=True)
        except KeyboardInterrupt :
            pass
    elif p == 'win':
        try:
            subprocess.call(
                'http-server -c-1 -g -o'.format(fips_dir),
                cwd = webpage_dir, shell=True)
        except KeyboardInterrupt:
            pass
    elif p == 'linux':
        try:
            subprocess.call(
                'http-server -c-1 -g -o'.format(fips_dir),
                cwd = webpage_dir, shell=True)
        except KeyboardInterrupt:
            pass

#-------------------------------------------------------------------------------
def run(fips_dir, proj_dir, args) :
    if len(args) > 0 :
        if args[0] == 'build' :
            build_deploy_webpage(fips_dir, proj_dir)
        elif args[0] == 'serve' :
            serve_webpage(fips_dir, proj_dir)
        else :
            log.error("Invalid param '{}', expected 'build' or 'serve'".format(args[0]))
    else :
        log.error("Param 'build' or 'serve' expected")

#-------------------------------------------------------------------------------
def help() :
    log.info(log.YELLOW +
             'fips webpage build\n' +
             'fips webpage serve\n' +
             log.DEF +
             '    build the doom-sokol webpage')
