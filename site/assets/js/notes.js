/* TextHub: migrates the original note, never silently discards it. */
(function () {
  const KEY='supersuite.texthub',OLD='supersuite.notes.pad';
  const note=document.getElementById('note'),saved=document.getElementById('saved'),list=document.getElementById('note-list'),title=document.getElementById('note-title'),font=document.getElementById('note-font'),size=document.getElementById('note-size');
  let book=[],active=0;
  try {const data=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(data)&&data.length)book=data;}catch(_){}
  if(!book.length){let text='';try{text=localStorage.getItem(OLD)||'';}catch(_){}book=[{title:'My note',text,font:'system-ui',size:'18'}];}
  function stats(){const value=note.value;document.getElementById('words').textContent=value.trim()?value.trim().split(/\s+/).length:0;document.getElementById('chars').textContent=[...value].length.toLocaleString();document.getElementById('lines').textContent=value?value.split('\n').length:0;}
  function options(){list.replaceChildren();book.forEach((entry,i)=>list.append(new Option(entry.title||'Untitled',String(i))));list.value=String(active);}
  function capture(){book[active]={title:title.value||'Untitled',text:note.value,font:font.value,size:size.value};}
  function persist(){capture();try{localStorage.setItem(KEY,JSON.stringify(book));saved.textContent='Saved locally · '+new Date().toLocaleTimeString();}catch(_){saved.textContent='Not saved — storage is full or disabled. Export your notebook.';}options();stats();}
  function show(){const entry=book[active];title.value=entry.title;note.value=entry.text;font.value=entry.font||'system-ui';size.value=entry.size||'18';note.style.fontFamily=font.value;note.style.fontSize=size.value+'px';options();stats();}
  list.onchange=()=>{capture();active=Number(list.value);show();};
  note.oninput=persist;title.oninput=persist;
  font.onchange=size.onchange=()=>{note.style.fontFamily=font.value;note.style.fontSize=size.value+'px';persist();};
  document.getElementById('note-new').onclick=()=>{capture();if(book.length>=200){SS.toast('Notebook limit: 200 notes. Export or delete an old note.');return;}book.push({title:'Untitled '+(book.length+1),text:'',font:'system-ui',size:'18'});active=book.length-1;show();persist();note.focus();};
  document.getElementById('note-delete').onclick=()=>{if(!confirm('Delete this note? Export it first if you need a backup.'))return;book.splice(active,1);if(!book.length)book.push({title:'My note',text:'',font:'system-ui',size:'18'});active=Math.min(active,book.length-1);show();persist();};
  document.getElementById('note-symbol').onchange=e=>{if(!e.target.value)return;note.setRangeText(e.target.value,note.selectionStart,note.selectionEnd,'end');e.target.value='';note.focus();persist();};
  document.getElementById('note-find-next').onclick=()=>{const q=document.getElementById('note-find').value;if(!q)return;let index=note.value.toLowerCase().indexOf(q.toLowerCase(),note.selectionEnd);if(index<0)index=note.value.toLowerCase().indexOf(q.toLowerCase());if(index<0){saved.textContent='No matches.';return;}note.focus();note.setSelectionRange(index,index+q.length);saved.textContent='Match at character '+(index+1);};
  document.getElementById('clear').onclick=()=>{if(note.value&&confirm('Clear this note? This cannot be undone.')){note.value='';persist();}};
  document.getElementById('copy').onclick=()=>SS.copy(note.value);
  document.getElementById('download').onclick=()=>SS.download((title.value.replace(/[^\p{L}\p{N} _-]/gu,'')||'note')+'.txt',new Blob([note.value],{type:'text/plain;charset=utf-8'}));
  document.getElementById('note-export-all').onclick=()=>{capture();SS.download('supersuite-notebook.json',new Blob([JSON.stringify(book,null,2)],{type:'application/json'}));};
  show();
})();
