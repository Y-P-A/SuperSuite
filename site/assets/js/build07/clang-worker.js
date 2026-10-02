/* Console C/C++ compiler. Compilation and execution both use WASM locally. */
importScripts('/vendor/clang/shared.js');
const BASE='https://binji.github.io/wasm-clang/';
let output='';
function write(s){output+=s.replace(/\x1b\[[0-9;]*m/g,'');if(output.length>1000000)throw Error('Output exceeded the 1 MB limit.');}
async function buffer(file){const response=await fetch(BASE+file);if(!response.ok)throw Error('Compiler asset failed to load: '+file);return response.arrayBuffer();}
onmessage=async function(event){
  output='';
  try{
    postMessage({progress:'Loading the local Clang WASM compiler and C/C++ standard libraries (about 45 MB on first run)…'});
    const api=new API({readBuffer:buffer,compileStreaming:async f=>WebAssembly.compile(await buffer(f)),hostWrite:write});
    await api.ready;
    const input=event.data.language==='c'?'main.c':'main.cpp';
    api.memfs.addFile(input,new TextEncoder().encode(event.data.code));
    const clang=await api.getModule(api.clangFilename);
    postMessage({progress:'Compiling '+input+' to WebAssembly…'});
    await api.run(clang,'clang','-cc1','-emit-obj',...api.clangCommonArgs,'-O1','-o','main.o','-x',event.data.language==='c'?'c':'c++',input);
    await api.link('main.o','main.wasm');
    const module=await WebAssembly.compile(api.memfs.getFileContents('main.wasm'));
    api.memfs.setStdinStr(event.data.stdin||'');
    output='';
    await api.run(module,'main.wasm');
    postMessage({output:output.trim()||'(completed without output)'});
  }catch(err){postMessage({error:output+'\n'+err.message});}
};
