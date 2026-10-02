/* Slug Generator — headline in, URL-safe slug out. */
(function () {
  const input = document.getElementById('input');
  const sep = document.getElementById('sep');
  const max = document.getElementById('max');
  const stop = document.getElementById('stop');
  const strip = document.getElementById('strip');
  const output = document.getElementById('output');
  const recent = document.getElementById('recent');

  const STOP = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'and', 'or', 'for', 'with', 'is', 'it']);
  let saved = [];

  function slugify(value) {
    let text = value;
    if (strip.checked) text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let words = text.toLowerCase().replace(/['’]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/).filter(Boolean);
    if (stop.checked) {
      const kept = words.filter(function (w) { return !STOP.has(w); });
      if (kept.length) words = kept;
    }
    let out = words.join(sep.value);
    const limit = Number(max.value) || 0;
    if (limit && out.length > limit) {
      out = out.slice(0, limit);
      const cut = out.lastIndexOf(sep.value);
      if (cut > 0) out = out.slice(0, cut);
    }
    return out;
  }

  function render() { output.textContent = slugify(input.value); }

  [input, max].forEach(function (el) { el.addEventListener('input', render); });
  [sep, stop, strip].forEach(function (el) { el.addEventListener('change', render); });

  document.getElementById('copy').addEventListener('click', function () {
    const value = output.textContent;
    if (!value) return;
    SS.copy(value);
    saved = [value].concat(saved.filter(function (s) { return s !== value; })).slice(0, 8);
    recent.innerHTML = saved.map(function (s) {
      return '<button class="chip" type="button" data-slug="' + s.replace(/"/g, '&quot;') + '">' + s + '</button>';
    }).join('');
  });

  recent.addEventListener('click', function (event) {
    const button = event.target.closest('[data-slug]');
    if (button) { input.value = button.getAttribute('data-slug'); render(); }
  });

  render();
})();
