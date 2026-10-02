/* Distinct runtime adapters. Node is not the browser JavaScript workspace. */
(function () {
  const language=document.getElementById('code-language'),editor=document.getElementById('code-editor'),out=document.getElementById('code-output'),run=document.getElementById('code-run'),frame=document.getElementById('code-preview'),wasm=document.getElementById('code-wasm');
  const KEY='supersuite.codehub';
  const examples={c:'#include <stdio.h>\nint main(void) {\n  puts("Hello from C WebAssembly!");\n  return 0;\n}',cpp:'#include <iostream>\nint main() {\n  std::cout << "Hello from C++ WebAssembly!" << std::endl;\n  return 0;\n}',python:'print("Hello from Python!")\nprint(sum(range(1, 11)))',node:'const os = require("node:os");\nconsole.log("Node.js", process.version);\nconsole.log("Platform:", os.platform());',java:'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}',kotlin:'fun main() {\n    println("Hello from Kotlin!")\n}'};
  let saved={},worker=null,controller=null,timer=null,active='python',generation=0;
  try { saved=JSON.parse(localStorage.getItem(KEY)||'{}'); } catch (_) {}
  const webIds=['html','css','js'];
  function remember(){if(examples[active])saved[active]=editor.value;webIds.forEach(id=>saved[id]=document.getElementById('code-'+id).value);saved.stdin=document.getElementById('code-stdin').value;}
  function persist(){remember();try{localStorage.setItem(KEY,JSON.stringify(saved));SS.toast('Workspace saved');}catch(_){SS.toast('Browser storage is full or disabled');}}
  function stop(message){generation++;if(worker)worker.terminate();worker=null;if(controller)controller.abort();controller=null;clearTimeout(timer);run.disabled=false;if(message)out.textContent=message;}
  let initialized=false;
  function sync(){const v=language.value;stop();if(initialized)remember();initialized=true;active=v;const isWasm=v==='c'||v==='cpp';document.getElementById('code-source').hidden=v==='web';document.getElementById('code-web').hidden=v!=='web';frame.hidden=v!=='web';run.hidden=false;editor.value=saved[v]??examples[v]??'';
    document.getElementById('code-runtime-note').textContent=v==='python'?'Pyodide 314.0.7 runs Python locally. The first run downloads the runtime; packages referenced in imports load on demand.':v==='web'?'HTML, CSS and JavaScript work together in one sandboxed preview.':isWasm?'C and C++ use the embedded Clang WebAssembly studio below. Edit its source and use its own Run button. For C++, open a .cpp example or file. Compilation and execution happen in that studio, not Judge0.':'Real '+(v==='node'?'Node.js':v==='java'?'Java':'Kotlin')+' execution through public Judge0 CE. Source and stdin leave your browser when you press Run.';
    if(isWasm&&!wasm.src)wasm.src='https://binji.github.io/wasm-clang/';
    out.textContent=isWasm?'Use Run in the embedded WASM studio.':'Ready.';
  }
  language.onchange=sync;
  document.getElementById('code-stop').onclick=()=>{stop('Stopped.');frame.srcdoc='';if(!wasm.hidden){wasm.src='about:blank';wasm.removeAttribute('src');}};
  document.getElementById('code-save').onclick=persist;
  document.getElementById('code-download').onclick=()=>{remember();const value=active==='web'?JSON.stringify({html:saved.html,css:saved.css,js:saved.js},null,2):editor.value;SS.download('supersuite-code.'+({python:'py',node:'js',java:'java',kotlin:'kt',web:'json'}[active]||'txt'),new Blob([value],{type:'text/plain'}));};
  document.getElementById('code-reset').onclick=()=>{editor.value=examples[active]||'';out.textContent='Example restored.';};
  webIds.forEach(id=>{if(typeof saved[id]==='string')document.getElementById('code-'+id).value=saved[id];});
  document.getElementById('code-stdin').value=saved.stdin||'';
  run.onclick=async()=>{
    stop();remember();const myGeneration=generation;run.disabled=true;
    out.textContent=active==='python'?'Loading Python 314.0.7 and running…':'Running…';
    if(active==='web'){
      const script=saved.js.replace(/<\/script/gi,'<\\/script'),css=saved.css.replace(/<\/style/gi,'<\\/style');
      frame.srcdoc='<!doctype html><html><head><meta charset="utf-8"><style>'+css+'</style></head><body>'+saved.html+'<script>'+script+'</script></body></html>';
      out.textContent='HTML, CSS and JavaScript preview updated.';run.disabled=false;return;
    }
    timer=setTimeout(()=>stop('Stopped after the 60-second limit. If Python was still downloading, try again.'),60000);
    if(active==='python'){
      worker=new Worker('/assets/js/build07/python-worker.js',{type:'module'});
      worker.onmessage=e=>{if(myGeneration!==generation)return;out.textContent=e.data.error?'Error: '+e.data.error:e.data.output;clearTimeout(timer);run.disabled=false;worker.terminate();worker=null;};
      worker.onerror=()=>stop('Python runtime could not load. Check your connection and try again.');worker.postMessage({code:editor.value,stdin:saved.stdin});return;
    }
    controller=new AbortController();
    try {
      const lang={node:102,java:91,kotlin:78}[active];
      if(!lang)throw Error('Use the embedded WASM studio for this language.');
      const response=await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language_id:lang,source_code:editor.value,stdin:saved.stdin,cpu_time_limit:3,wall_time_limit:10,...(active==='kotlin'?{compiler_options:'-nowarn'}:{})}),signal:controller.signal});
      if(!response.ok)throw Error('Judge0 returned '+response.status+'. The public service may be busy or unavailable.');
      let result=await response.json();
      for(let i=0;result.token&&(!result.status||result.status.id<=2)&&i<25;i++){
        await new Promise(r=>setTimeout(r,1000));if(myGeneration!==generation)return;
        const poll=await fetch('https://ce.judge0.com/submissions/'+encodeURIComponent(result.token)+'?base64_encoded=false',{signal:controller.signal});if(!poll.ok)throw Error('Could not retrieve execution result.');result=await poll.json();
      }
      if(myGeneration!==generation)return;
      out.textContent=[result.stdout,result.stderr,result.compile_output,result.message,'Status: '+(result.status?.description||'Unknown')].filter(Boolean).join('\n');
    } catch(err){if(myGeneration===generation)out.textContent='Execution error: '+err.message;}
    finally{if(myGeneration===generation){clearTimeout(timer);run.disabled=false;controller=null;}}
  };
  sync();
})();
