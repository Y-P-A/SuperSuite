/* Local media transcoding using vendored, single-threaded FFmpeg WASM. */
(function () {
  let engine=null;
  const mime={mp4:'video/mp4',webm:'video/webm',gif:'image/gif',mp3:'audio/mpeg',wav:'audio/wav',png:'image/png',jpg:'image/jpeg',webp:'image/webp',bmp:'image/bmp'};
  function loadScript(){return new Promise((resolve,reject)=>{if(window.FFmpegWASM){resolve();return;}const script=document.createElement('script');script.src='/vendor/ffmpeg/ffmpeg.js';script.onload=resolve;script.onerror=()=>reject(Error('Media converter could not load.'));document.head.append(script);});}
  window.SS = window.SS || {};
  SS.convertMedia=async function(files,format,status){
    const allowed=['mp4','webm','gif','mp3','wav','png','jpg','webp','bmp'];
    if(!allowed.includes(format))throw Error('For video and audio, choose MP4, WebM, GIF, MP3, WAV or a still-image format.');
    if(files.some(f=>f.size>100*1024*1024))throw Error('Media inputs are limited to 100 MB per file to protect browser memory.');
    status.textContent='Loading the local media engine (about 31 MB on first use)…';
    await loadScript();
    if(!engine){engine=new FFmpegWASM.FFmpeg();engine.on('progress',e=>{if(e.progress>=0&&e.progress<=1)status.textContent='Converting locally… '+Math.round(e.progress*100)+'%';});await engine.load({coreURL:location.origin+'/vendor/ffmpeg/ffmpeg-core.js',wasmURL:location.origin+'/vendor/ffmpeg/ffmpeg-core.wasm'});}
    const results=[];
    for(let i=0;i<files.length;i++){
      const f=files[i],ext=(f.name.match(/\.([a-z0-9]+)$/i)||[])[1]||'dat',input='input-'+i+'.'+ext,output='output-'+i+'.'+format;
      status.textContent='Converting '+f.name+' locally…';await engine.writeFile(input,new Uint8Array(await f.arrayBuffer()));
      try{
        let args=['-i',input];
        if(format==='mp4')args.push('-c:v','libx264','-preset','ultrafast','-crf','28','-c:a','aac','-movflags','+faststart');
        else if(format==='webm')args.push('-c:v','libvpx','-deadline','realtime','-cpu-used','8','-c:a','libvorbis');
        else if(format==='gif')args.push('-vf','fps=10,scale=480:-1:flags=lanczos','-t','15');
        else if(format==='mp3')args.push('-vn','-c:a','libmp3lame','-b:a','192k');
        else if(format==='wav')args.push('-vn','-c:a','pcm_s16le');
        else args.push('-frames:v','1');
        args.push('-y',output);
        const code=await engine.exec(args,120000);if(code!==0)throw Error('This input could not be converted to '+format.toUpperCase()+'. It may have no required audio/video stream or use an unsupported codec.');
        const data=await engine.readFile(output);results.push({name:f.name.replace(/\.[^.]+$/,'')+'.'+format,blob:new Blob([data],{type:mime[format]}),note:format==='gif'?'10 fps, up to 15 seconds':'Converted locally'});
      } finally {await engine.deleteFile(input).catch(()=>{});await engine.deleteFile(output).catch(()=>{});}
    }
    return results;
  };
  SS.cancelMedia=function(){if(engine){engine.terminate();engine=null;}};
  SS.imageExtra=async function(canvas,format){
    if(format==='svg'){
      const data=canvas.toDataURL('image/png');return new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="'+canvas.width+'" height="'+canvas.height+'"><image width="100%" height="100%" href="'+data+'"/></svg>'],{type:'image/svg+xml'});
    }
    if(format!=='bmp')throw Error('Unsupported image format.');
    const w=canvas.width,h=canvas.height,stride=Math.ceil(w*3/4)*4,total=54+stride*h,buf=new ArrayBuffer(total),view=new DataView(buf),pixels=canvas.getContext('2d').getImageData(0,0,w,h).data;
    view.setUint16(0,0x4d42,true);view.setUint32(2,total,true);view.setUint32(10,54,true);view.setUint32(14,40,true);view.setInt32(18,w,true);view.setInt32(22,h,true);view.setUint16(26,1,true);view.setUint16(28,24,true);view.setUint32(34,stride*h,true);
    const bytes=new Uint8Array(buf);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const src=(y*w+x)*4,dst=54+(h-1-y)*stride+x*3;bytes[dst]=pixels[src+2];bytes[dst+1]=pixels[src+1];bytes[dst+2]=pixels[src];}
    return new Blob([buf],{type:'image/bmp'});
  };
})();
