# Browser Clang adapter

`shared.js` comes from https://github.com/binji/wasm-clang (served by https://binji.github.io/wasm-clang/shared.js). Copyright 2020 WebAssembly Community Group participants; Apache License 2.0, as recorded in the source header. Full license: https://www.apache.org/licenses/LICENSE-2.0 .

CodeHub's own worker uses the upstream WASI filesystem and execution adapter, with explicit C or C++ compilation. Compiler, linker, filesystem WASM and sysroot libraries are downloaded on demand from the upstream demo host; they are not bundled in this repository. The upstream Clang 8-era distribution is experimental, not a replacement for a modern native toolchain. Source/build notes: https://github.com/binji/wasm-clang and https://gist.github.com/binji/b7541f9740c21d7c6dac95cbc9ea6fca .

The application exposes console programs, stdin and stdout, not the upstream canvas API. Workers can be terminated through CodeHub's Stop button. C/C++ user code is compiled and executed locally, not sent to Judge0.
