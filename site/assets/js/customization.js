/* Visibility is independent of appearance; hidden tools remain browsable. */
(function () {
  const SS = window.SS;
  const KEY = 'supersuite.hiddenUtilities';
  let hidden;
  try { const saved = JSON.parse(localStorage.getItem(KEY) || '[]'); hidden = new Set(Array.isArray(saved) ? saved : []); }
  catch (_) { hidden = new Set(); }
  const listeners = [];
  SS.visibility = {
    has: function (href) { return hidden.has(href); },
    count: function () { return hidden.size; },
    set: function (href, hide) {
      if (hide) hidden.add(href); else hidden.delete(href);
      save();
    },
    reset: function () { hidden.clear(); save(); },
    onChange: function (fn) { listeners.push(fn); fn(); }
  };
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(Array.from(hidden))); }
    catch (_) { SS.toast('Visibility could not be saved in this browser'); }
    listeners.forEach(function (fn) { fn(); });
  }
})();
