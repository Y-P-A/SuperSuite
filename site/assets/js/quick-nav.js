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
    const catalog = window.SS_CATALOG;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="quick-scrim" id="ss-quick-scrim" hidden></div>' +
      '<aside class="command quick-command" id="ss-quick-nav" role="dialog" aria-modal="true" aria-labelledby="ss-quick-title" hidden>' +
      '<aside class="rail"><nav aria-label="Quick navigation categories"><a href="#" data-nav-category="" aria-current="true">All utilities</a>' +
      catalog.categories.map(cat => '<a href="#" data-nav-category="' + cat.id + '">' + cat.name + '</a>').join('') +
      '<a href="#" data-nav-category="games">Games</a></nav><nav class="nav-overviews" aria-label="Overview pages"><a href="/">Home</a><a href="/utilities/">Browse all utilities</a><a href="/games/">Browse all games</a></nav></aside>' +
      '<div class="command-panel"><header class="head"><h1 id="ss-quick-title">Quick navigation</h1><button class="command-btn" id="ss-quick-close" type="button">Close</button></header>' +
      '<input class="search" id="quick-search" type="search" aria-label="Search quick navigation" placeholder="Find your next tool…"><p class="hint" id="quick-count" role="status"></p><div class="nav-results"></div></div></aside>');
    panel = document.getElementById('ss-quick-nav');
    scrim = document.getElementById('ss-quick-scrim');
    let category = '';
    function render() {
      const q = document.getElementById('quick-search').value.toLowerCase().trim();
      const source = category === 'games' ? catalog.games : catalog.utilities;
      const entries = source.filter(entry => (category === 'games' || !category || entry.category === category) &&
        (category === 'games' || !window.SS.visibility.has(entry.href)) && (entry.name + ' ' + entry.desc).toLowerCase().includes(q));
      const results = panel.querySelector('.nav-results');
      results.replaceChildren();
      entries.forEach(function (entry) {
        const link = document.createElement('a');
        link.className = 'link'; link.href = entry.href;
        if (location.pathname.replace(/\.html$/, '') === entry.href) link.setAttribute('aria-current','page');
        const icon = document.createElement('span'); icon.className = 'utility-mark ' + entry.tone; icon.innerHTML = entry.icon;
        const text = document.createElement('span'); text.textContent = entry.name;
        const detail = document.createElement('small'); detail.textContent = entry.tag; text.appendChild(detail);
        link.append(icon,text); results.appendChild(link);
      });
      document.getElementById('quick-count').textContent = entries.length + (category === 'games' ? ' games' : ' utilities') + (entries.length ? ' · pick one to jump in' : ' — no matches. Try another search or restore hidden tools in Settings.');
    }
    panel.querySelectorAll('[data-nav-category]').forEach(function (link) {
      link.addEventListener('click',function (event) {
        event.preventDefault(); category = link.dataset.navCategory;
        panel.querySelectorAll('[data-nav-category]').forEach(a => a.removeAttribute('aria-current'));
        link.setAttribute('aria-current','true'); render();
      });
    });
    document.getElementById('quick-search').addEventListener('input',render);
    window.SS.visibility.onChange(render);
    document.getElementById('ss-quick-close').addEventListener('click', close);
    scrim.addEventListener('click', close);
    panel.addEventListener('keydown',function (event) { if (event.key === 'Tab') window.SS.trapFocus(panel,event); });
  }

  function show() {
    clearTimeout(timer);
    if (!panel) build();
    if (window.SS.closeSettings) window.SS.closeSettings();
    panel.hidden = false;
    scrim.hidden = false;
    home.setAttribute('aria-expanded', 'true');
    document.getElementById('quick-search').focus();
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

  window.SS.closeQuickNav = close;
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
