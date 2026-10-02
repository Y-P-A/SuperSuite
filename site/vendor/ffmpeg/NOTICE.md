# FFmpeg WASM third-party components

- `ffmpeg.js`, `814.ffmpeg.js`: @ffmpeg/ffmpeg 0.12.10, MIT, copyright Jerome Wu. License: `LICENSE`. Source and build instructions: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/v0.12.10
- `ffmpeg-core.js`, `ffmpeg-core.wasm`: @ffmpeg/core 0.12.6, single-thread distribution. The FFmpeg core and included codecs have their own licenses; this build includes GPL codecs. GPLv3 text: `COPYING.GPLv3`. Corresponding upstream source, component versions and build scripts: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/v0.12.6 (see `build/`, Dockerfile and core package). FFmpeg source: https://github.com/FFmpeg/FFmpeg ; x264 source: https://code.videolan.org/videolan/x264 .

Files were obtained from the version-pinned official npm distributions through jsDelivr. Application media files stay in browser memory and are not sent to a conversion server. The app downloads these runtime assets only when media conversion is used.

Before production redistribution, review GPL source-distribution obligations for the compiled core and all bundled codecs; retain the license and provide corresponding source/build materials alongside the binary distribution.
