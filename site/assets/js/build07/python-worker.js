/* Python runs away from the UI thread; stopping terminates the worker. */
let pyodide;
onmessage = async function (event) {
  try {
    if (!pyodide) {
      const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs');
      pyodide = await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/'});
    }
    let output = '';
    pyodide.setStdout({batched:s=>{output+=s+'\n';}});
    pyodide.setStderr({batched:s=>{output+=s+'\n';}});
    const lines=event.data.stdin.split('\n');let index=0;
    pyodide.setStdin({stdin:()=>index<lines.length?lines[index++]:null});
    await pyodide.loadPackagesFromImports(event.data.code);
    const value = await pyodide.runPythonAsync(event.data.code);
    if(value!==undefined && value!==null) output+=String(value)+'\n';
    if(value && value.destroy) value.destroy();
    postMessage({output:output||'(completed without output)'});
  } catch (err) { postMessage({error:err.message}); }
};
