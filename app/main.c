#include <stdint.h>
#include <stdbool.h>
#include <malloc.h>

#include <coreinit/screen.h>
#include <coreinit/cache.h>
#include <whb/log_cafe.h>
#include <whb/log_udp.h>
#include <whb/log.h>
#include <whb/proc.h>

int main(int argc, char** argv) {
    WHBLogCafeInit();
    WHBLogUdpInit();
    WHBLogPrint("Hello World! Logging initalised.");

    WHBProcInit();
    OSScreenInit();
    size_t tvBufferSize = OSScreenGetBufferSizeEx(SCREEN_TV);
    size_t drcBufferSize = OSScreenGetBufferSizeEx(SCREEN_DRC);
    WHBLogPrintf("Will aloocate 0x%X bytes for the TV, " \
        "and 0x%X bytes for the DRC.", 
        tvBufferSize, drcBufferSize);

    void* tvBuffer = memalign(0x100, tvBufferSize);
    void* drcBuffer = memalign(0x100, drcBufferSize);

    if (!tvBuffer || !drcBuffer) {
        WHBLogPrint("Out of memory!");

        if (tvBuffer) free(tvBuffer);
        if (drcBuffer) free(drcBuffer);

        OSScreenShutdown;
        WHBProcShutdown;

        WHBLogPrint("Quitting.");
        WHBLogCafeDeinit();
        WHBLogUdpDeinit();

        return 1;
    }
    
    OSScreenSetBufferEx(SCREEN_TV, tvBuffer);
    OSScreenSetBufferEx(SCREEN_DRC, drcBuffer);

    OSScreenEnableEx(SCREEN_TV, true);
    OSScreenEnableEx(SCREEN_DRC, true);

    while(WHBProcIsRunning()) {
        OSScreenClearBufferEx(SCREEN_TV, 0x00000000);
        OSScreenClearBufferEx(SCREEN_DRC, 0x00000000);

        OSScreenPutFontEx(SCREEN_TV, 0, 0, "Hello world! This is the TV.");
        OSScreenPutFontEx(SCREEN_TV, 0, 1, "Neat, right?");

        OSScreenPutFontEx(SCREEN_DRC, 0, 0, "Hello world! This is the DRC.");
        OSScreenPutFontEx(SCREEN_DRC, 0, 1, "Neat, right?");

        DCFlushRange(tvBuffer, tvBufferSize);
        DCFlushRange(drcBuffer, drcBufferSize);

        OSScreenFlipBuffersEx(SCREEN_TV);
        OSScreenFlipBuffersEx(SCREEN_DRC);
    }

    WHBLogPrint("Got shutdown request!");

    if (tvBuffer) free(tvBuffer);
    if (drcBuffer) free(drcBuffer);

    OSScreenShutdown;
    WHBProcShutdown;

    WHBLogPrint("Quitting.");
    WHBLogCafeDeinit();
    WHBLogUdpDeinit();

    return 1;
}
