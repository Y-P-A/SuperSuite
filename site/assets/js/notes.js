/* Notes Pad — one note, saved to localStorage, with live counts. */
(function () {
  const KEY = 'supersuite.notes.pad';
  const note = document.getElementById('note');
  const saved = document.getElementById('saved');
  let timer = 0;

  function stats() {
    const value = note.value;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    document.getElementById('words').textContent = String(words);
    document.getElementById('chars').textContent = value.length.toLocaleString();
    document.getElementById('lines').textContent = value ? String(value.split('\n').length) : '0';
  }

  function persist() {
    try { localStorage.setItem(KEY, note.value); } catch (err) { /* ignore */ }
    saved.textContent = 'Saved at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  note.addEventListener('input', function () {
    stats();
    saved.textContent = 'Saving…';
    clearTimeout(timer);
    timer = setTimeout(persist, 400);
  });

  document.getElementById('clear').addEventListener('click', function () {
    if (!note.value || !confirm('Clear this note? This cannot be undone.')) return;
    note.value = '';
    stats();
    persist();
  });
  document.getElementById('copy').addEventListener('click', function () {
    if (note.value) SS.copy(note.value);
  });
  document.getElementById('download').addEventListener('click', function () {
    SS.download('supersuite-note.txt', new Blob([note.value], { type: 'text/plain' }));
  });

  try { note.value = localStorage.getItem(KEY) || ''; } catch (err) { /* ignore */ }
  stats();
  if (!note.value) saved.textContent = 'Saved automatically';
})();
