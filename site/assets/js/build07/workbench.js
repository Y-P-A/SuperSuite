/* Shared form renderer. Definitions live in small, category-specific modules. */
(function () {
  const T = window.SS_TOOLS = {};
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.Toolbox = {
    def: (id, fields, run, note) => { T[id] = {fields, run, note}; },
    number: (id, label, value, min, max) => ({id,label,value,type:'number',min,max}),
    text: (id, label, value) => ({id,label,value:value || '',type:'textarea'}),
    line: (id, label, value) => ({id,label,value:value || '',type:'text'}),
    select: (id, label, options) => ({id,label,value:options[0],type:'select',options}),
    esc,
    list: s => { const a = s.trim().split(/[\s,;]+/).map(Number); if (!s.trim() || a.some(n => !Number.isFinite(n))) throw Error('Enter a non-empty list of finite numbers.'); return a; },
    positive: n => { if (!(n > 0)) throw Error('This value must be greater than zero.'); return n; },
    integer: (n, min, max) => { if (!Number.isSafeInteger(n) || n < min || n > max) throw Error('Enter an integer between ' + min + ' and ' + max + '.'); return n; },
    fmt: n => { if (!Number.isFinite(n)) throw Error('The result is outside the supported numeric range.'); return Number(n.toPrecision(12)).toString(); },
    save: (key, value) => { localStorage.setItem('supersuite.tool.' + key, value); },
    load: (key, fallback) => { try { return localStorage.getItem('supersuite.tool.' + key) || fallback; } catch (_) { return fallback; } }
  };
  function mount() {
    const host = document.getElementById('workbench');
    if (!host) return;
    const id = document.body.dataset.tool;
    const tool = T[id];
    if (!tool) { host.textContent = 'This tool could not be loaded.'; return; }
    host.innerHTML = '<form id="tool-form" class="stack"><div class="tool-fields">' + tool.fields.map(f => {
      const label = '<label for="tool-' + f.id + '">' + esc(f.label) + '</label>';
      const attrs = ' id="tool-' + f.id + '" name="' + f.id + '"';
      let control;
      if (f.type === 'select') control = '<select class="select"' + attrs + '>' + f.options.map(o => '<option>' + esc(o) + '</option>').join('') + '</select>';
      else if (f.type === 'textarea') control = '<textarea class="textarea" rows="5"' + attrs + '>' + esc(f.value) + '</textarea>';
      else control = '<input class="input"' + attrs + ' type="' + f.type + '" value="' + esc(f.value) + '"' + (f.type === 'number' ? ' step="any" required' + (f.min !== undefined ? ' min="'+ f.min +'"' : '') + (f.max !== undefined ? ' max="'+ f.max +'"' : '') : '') + '>';
      return '<div class="field">' + label + control + '</div>';
    }).join('') + '</div><div class="btn-row"><button class="btn btn--primary" id="tool-run">Run tool</button><button class="btn" type="button" id="tool-copy">Copy result</button><button class="btn" type="button" id="tool-download">Download result</button></div></form><p class="note" id="tool-note"></p><div id="tool-preview"></div><pre class="output" id="tool-result" role="status">Enter your values, then press Run tool.</pre>';
    document.getElementById('tool-note').textContent = tool.note || 'Runs locally in this browser. Check the input units before calculating.';
    let result = '', blob = null, filename = id + '.txt';
    const form = document.getElementById('tool-form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const out = document.getElementById('tool-result'), preview = document.getElementById('tool-preview'), button = document.getElementById('tool-run');
      button.disabled = true;
      preview.replaceChildren(); blob = null;
      try {
        const data = {};
        tool.fields.forEach(f => { const el = form.elements.namedItem(f.id); data[f.id] = f.type === 'number' ? Number(el.value) : el.value; if (f.type === 'number' && !Number.isFinite(data[f.id])) throw Error('Enter finite numbers.'); });
        const answer = await tool.run(data);
        result = typeof answer === 'object' ? answer.text : String(answer);
        if (answer && answer.html) preview.innerHTML = answer.html;
        if (answer && answer.svg) { const image = document.createElement('img'); image.alt = 'Generated graphic'; const graphic = new Blob([answer.svg], {type:'image/svg+xml'}); const url = URL.createObjectURL(graphic); image.src = url; image.onload = () => URL.revokeObjectURL(url); preview.append(image); blob = graphic; filename = id + '.svg'; }
        out.textContent = result;
      } catch (err) { result = ''; out.textContent = 'Error: ' + err.message; }
      finally { button.disabled = false; }
    });
    document.getElementById('tool-copy').onclick = () => SS.copy(result);
    document.getElementById('tool-download').onclick = () => { if (result) SS.download(filename, blob || new Blob([result], {type:'text/plain;charset=utf-8'})); };
  }
  document.addEventListener('DOMContentLoaded', mount);
})();
