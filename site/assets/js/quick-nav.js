/* Home on a tap; quick navigation on right-click, hold, or Alt+ArrowDown. */
(function () {
  const home = document.getElementById('ss-home');
  if (!home) return;
  let timer = 0;
  let held = false;
  let startX = 0;
  let startY = 0;
  let panel = null;
  let scrim = null;

  function close() {
    if (!panel) return;
    panel.hidden = true;
    scrim.hidden = true;
    home.setAttribute('aria-expanded', 'false');
    home.focus();
  }

  function build() {
    const catalog = window.SS_CATALOG || {};
    document.body.insertAdjacentHTML('beforeend',
      '<div class="quick-scrim" id="ss-quick-scrim" hidden></div>' +
      '<aside class="quick-nav" id="ss-quick-nav" role="dialog" aria-modal="true" aria-labelledby="ss-quick-title" hidden>' +
      '<div class="quick-nav__head"><h2 id="ss-quick-title">Quick navigation</h2><button class="btn" id="ss-quick-close" type="button">Close</button></div>' +
      '<div class="quick-nav__body"><p class="quick-nav__hint">Jump straight to a utility or game.</p><a href="/">Home</a></div></aside>');
    panel = document.getElementById('ss-quick-nav');
    scrim = document.getElementById('ss-quick-scrim');
    const body = panel.querySelector('.quick-nav__body');
    ['utilities', 'games'].forEach(function (section) {
      const heading = document.createElement('h3');
      const overview = document.createElement('a');
      heading.textContent = section === 'utilities' ? 'Utilities' : 'Games';
      overview.textContent = 'Browse all ' + section;
      overview.href = '/' + section + '/';
      body.append(heading, overview);
      (catalog[section] || []).forEach(function (entry) {
        const link = document.createElement('a');
        link.href = entry.href;
        link.textContent = entry.name;
        if (location.pathname === entry.href) link.setAttribute('aria-current', 'page');
        body.appendChild(link);
      });
    });
    document.getElementById('ss-quick-close').addEventListener('click', close);
    scrim.addEventListener('click', close);
    panel.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      const controls = panel.querySelectorAll('button, a');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  function show() {
    clearTimeout(timer);
    if (!panel) build();
    panel.hidden = false;
    scrim.hidden = false;
    home.setAttribute('aria-expanded', 'true');
    document.getElementById('ss-quick-close').focus();
  }

  function open() {
    if (window.SS_CATALOG) { show(); return; }
    if (open.loading) return;
    open.loading = true;
    const script = document.createElement('script');
    script.src = '/assets/js/catalog.js';
    script.onload = function () { open.loading = false; show(); };
    script.onerror = function () { open.loading = false; window.SS.toast('Quick navigation could not load'); };
    document.head.appendChild(script);
  }

  home.addEventListener('contextmenu', function (event) { event.preventDefault(); open(); });
  home.addEventListener('pointerdown', function (event) {
    if (event.button !== 0) return;
    held = false;
    startX = event.clientX;
    startY = event.clientY;
    timer = setTimeout(function () { held = true; open(); }, 550);
  });
  home.addEventListener('pointermove', function (event) {
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) clearTimeout(timer);
  });
  ['pointerup', 'pointercancel'].forEach(function (name) {
    window.addEventListener(name, function () {
      clearTimeout(timer);
      /* The release's click runs first; never suppress a later, separate tap. */
      setTimeout(function () { held = false; }, 0);
    });
  });
  home.addEventListener('click', function (event) {
    if (held) { event.preventDefault(); held = false; }
  });
  home.addEventListener('keydown', function (event) {
    if (event.altKey && event.key === 'ArrowDown') { event.preventDefault(); open(); }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && panel && !panel.hidden) close();
  });
})();
