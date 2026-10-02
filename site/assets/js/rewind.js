/* Rewind — the settings store. Loaded in <head> on every page so the chosen
   era is painted before anything else (no flash of the wrong decade).
   The UI lives in settings.js; this file only holds and applies state. */
(function () {
  const SS = (window.SS = window.SS || {});
  const KEY = 'supersuite.settings';

  const DEFAULTS = {
    rewind: 'classic',   // classic | 2010s | 2000s | 1990s | 2020s
    accent: '',          // '' = the era's own accent
    density: 'cozy',     // compact | cozy | roomy
    corners: 'sharp',    // sharp | soft | round
    scale: 'normal',     // small | normal | large
    cards: 'normal',     // compact | normal | large | list
    width: 'normal',     // normal | wide
    glow: false,
    scanlines: false,
    motion: true,
    opaque: false,
    clock: false
  };

  const root = document.documentElement;
  const listeners = [];
  let clockTimer = 0;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return Object.assign({}, DEFAULTS, raw ? JSON.parse(raw) : {});
    } catch (err) {
      return Object.assign({}, DEFAULTS);
    }
  }

  let settings = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (err) { /* ignore */ }
  }

  /* Black or near-black ink, whichever reads better on a background. */
  function inkOn(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return '#ffffff';
    let h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return lum > 0.55 ? '#0a0e17' : '#ffffff';
  }

  /* Runs in <head>, before the body exists, so only attributes go on here. */
  function apply() {
    root.setAttribute('data-rewind', settings.rewind);
    root.setAttribute('data-density', settings.density);
    root.setAttribute('data-corners', settings.corners);
    root.setAttribute('data-scale', settings.scale);
    root.setAttribute('data-cards', settings.cards);
    root.setAttribute('data-width', settings.width);
    root.classList.toggle('ss-glow', !!settings.glow);
    root.classList.toggle('ss-scanlines', !!settings.scanlines);
    root.classList.toggle('ss-motion-off', !settings.motion);
    root.classList.toggle('ss-opaque', !!settings.opaque);

    if (settings.accent) {
      root.style.setProperty('--accent', settings.accent);
      root.style.setProperty('--accent-ink', inkOn(settings.accent));
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-ink');
    }

    syncClock();
    listeners.forEach(function (fn) { fn(settings); });
  }

  /* The header clock is optional and only exists once the shell is mounted. */
  function syncClock() {
    const el = document.getElementById('ss-clock');
    if (!el) return;
    clearInterval(clockTimer);
    clockTimer = 0;
    if (!settings.clock) { el.hidden = true; return; }
    el.hidden = false;
    const tick = function () {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    tick();
    clockTimer = setInterval(tick, 20000);
  }

  SS.rewind = {
    DEFAULTS: DEFAULTS,
    options: {
      rewind: [
        { value: 'classic', label: 'Classic', hint: '2015 · the original' },
        { value: '2010s', label: '2010s', hint: 'Flat & minimal' },
        { value: '2000s', label: '2000s', hint: 'Glossy web 2.0' },
        { value: '1990s', label: '1990s', hint: 'Bevels & serifs' },
        { value: '2020s', label: '2020s', hint: 'Dark & glassy' }
      ],
      accent: ['', '#2980b9', '#16a085', '#27ae60', '#f1c40f', '#e67e22', '#c0392b', '#e84393', '#8e44ad', '#3498db'],
      density: ['compact', 'cozy', 'roomy'],
      corners: ['sharp', 'soft', 'round'],
      scale: ['small', 'normal', 'large'],
      cards: ['compact', 'normal', 'large', 'list'],
      width: ['normal', 'wide']
    },
    get: function () { return Object.assign({}, settings); },
    set: function (key, value) { settings[key] = value; save(); apply(); },
    reset: function () { settings = Object.assign({}, DEFAULTS); save(); apply(); },
    onChange: function (fn) { listeners.push(fn); fn(settings); },
    refresh: function () { syncClock(); },
    apply: apply
  };

  apply();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncClock);
  } else {
    syncClock();
  }
})();
