#define SOKOL_IMPL
#if defined(_WIN32)
#define SOKOL_LOG(s) OutputDebugStringA(s)
#endif
#include "sokol_app.h"
#include "sokol_gfx.h"
#include "sokol_debugtext.h"
#include "sokol_fetch.h"
#include "sokol_audio.h"
#include "sokol_log.h"
#include "sokol_glue.h"
