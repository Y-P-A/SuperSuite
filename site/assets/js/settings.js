/* Midnight Command settings. Appearance continues to use the Rewind store. */
(function () {
  const SS = window.SS;
  if (!SS.rewind || document.getElementById('ss-drawer')) return;
  const rw = SS.rewind, opt = rw.options;
  const esc = function (value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); };
  const sections = [['rewind','Rewind — change the look'],['accent','Accent color'],['layout','Layout'],['effects','Effects'],['experience','Your experience'],['utilities','Your utilities']];
  function seg(key) {
    return '<div class="seg" data-seg="' + key + '">' + opt[key].map(value => '<button type="button" data-value="' + value + '">' + value + '</button>').join('') + '</div>';
  }
  function row(key, label) { return '<div class="row"><span class="rowname">' + label + '</span>' + seg(key) + '</div>'; }
  function toggle(key, label, hint) {
    return '<div class="toggle"><span><strong>' + label + '</strong><small>' + hint + '</small></span><button class="switch" type="button" data-toggle="' + key + '" role="switch" aria-label="' + label + '" aria-checked="false"></button></div>';
  }
  function group(id, body) { return '<section class="group" id="setting-' + id + '"><h2>' + sections.find(s => s[0] === id)[1] + '</h2>' + body + '</section>'; }
  function quickLinks() {
    return '<aside class="quick"><header class="quickhead"><h2>Quick navigation</h2><button class="command-btn" type="button" data-close-settings>Close</button></header><p>Jump straight to a utility or game.</p><a class="link" href="/">Home</a><h3>Utilities</h3><a class="link" href="/utilities/">Browse all utilities</a><h3>Games</h3><a class="link" href="/games/">Browse all games</a></aside>';
  }
  const groups =
    group('rewind', '<div class="rewinds" data-seg="rewind">' + opt.rewind.map(era => '<button class="pick" type="button" data-value="' + era.value + '"><span class="command-swatch"></span>' + era.label + '<small>' + era.hint + '</small></button>').join('') + '</div><p class="hint">Rewind restyles the whole site — colours, type, corners and all the little details.</p>') +
    group('accent','<div class="accent" data-seg="accent">' + opt.accent.map(color => '<button class="dot" type="button" data-accent="' + color + '" style="background:' + (color || '#38bdf8') + '" aria-label="' + (color || 'Era default') + '"></button>').join('') + '</div>') +
    group('layout', '<div class="rows">' + row('density','Density') + row('corners','Corners') + row('scale','Text size') + row('cards','Cards') + row('width','Page width') + '</div>') +
    group('effects','<div class="toggles">' + toggle('glow','Neon glow','Make the accent light up the cards and buttons.') + toggle('scanlines','CRT scanlines','A retro overlay across the whole page.') + toggle('motion','Animations','Turn off for a still, instant feel.') + toggle('opaque','Solid surfaces','Drop the blur and translucency.') + toggle('clock','Header clock','Show the time in the top bar.') + '</div>') +
    group('experience','<div class="rows">' + row('font','Reading font') + row('reading','Line spacing') + row('clockFormat','Clock format') + '</div><div class="toggles">' + toggle('descriptions','Card descriptions','Show explanations in the utility and game catalogs.') + toggle('tags','Catalog tags','Show utility and game numbers on cards.') + toggle('decorations','Hero decorations','Show decorative shapes on the home page.') + toggle('stickyHeader','Keep header visible','Keep navigation at the top while scrolling.') + toggle('footer','Footer','Show the footer at the bottom of each page.') + '</div><div class="foot"><p>Build 0.8 (Beta 8) · Settings stay in this browser.</p><button class="command-btn reset" type="button" id="ss-reset">Reset everything</button></div>') +
    group('utilities','<p class="hint">Make SuperSuite yours. Hidden utilities disappear from Home and quick navigation, not the full Utilities page.</p><div class="foot"><span id="visibility-count" role="status"></span><button class="command-btn" id="restore-utilities" type="button">Show all utilities</button></div><label class="search-label" for="visibility-search">Find a utility</label><input class="search" id="visibility-search" type="search" placeholder="Search your utilities…"><div class="visibility-list"></div>');
  document.body.insertAdjacentHTML('beforeend','<div class="quick-scrim" id="ss-scrim" hidden></div><aside class="command settings-command" id="ss-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title" hidden><aside class="rail"><nav aria-label="Settings sections">' + sections.map((section,i) => '<a href="#setting-' + section[0] + '"' + (i === 0 ? ' aria-current="true"' : '') + '>' + section[1] + '</a>').join('') + '</nav></aside><div class="command-panel"><header class="head"><h1 id="settings-title">Settings</h1><button class="command-btn" type="button" id="ss-close">Close</button></header><input class="search" id="settings-search" type="search" aria-label="Search settings" placeholder="Search settings…"><div class="groups">' + groups + '</div></div>' + quickLinks() + '</aside>');
  const panel = document.getElementById('ss-drawer');
  const utilityList = panel.querySelector('.visibility-list');
  utilityList.innerHTML = SS_CATALOG.utilities.map(item => '<div class="visibility-row" data-href="' + item.href + '"><span class="utility-mark ' + item.tone + '">' + item.icon + '</span><span><strong>' + esc(item.name) + '</strong><small>' + esc(item.tag) + '</small></span><button class="command-btn" type="button" data-visibility="' + item.href + '"></button></div>').join('');
  function sync() {
    const settings = rw.get();
    panel.querySelectorAll('[data-seg]').forEach(function (group) {
      const key = group.dataset.seg;
      group.querySelectorAll('button').forEach(function (button) {
        const active = key === 'accent' ? button.dataset.accent === settings.accent : button.dataset.value === settings[key];
        button.classList.toggle('is-on', active);
        button.setAttribute('aria-pressed', String(active));
      });
    });
    panel.querySelectorAll('[data-toggle]').forEach(button => button.setAttribute('aria-checked', String(settings[button.dataset.toggle])));
  }
  SS.visibility.onChange(function () {
    panel.querySelectorAll('[data-visibility]').forEach(function (button) {
      const hidden = SS.visibility.has(button.dataset.visibility);
      button.textContent = hidden ? 'Show' : 'Hide';
      button.setAttribute('aria-label', (hidden ? 'Show ' : 'Hide ') + SS_CATALOG.utilities.find(item => item.href === button.dataset.visibility).name);
      button.closest('.visibility-row').classList.toggle('is-hidden', hidden);
    });
    document.getElementById('visibility-count').textContent = SS.visibility.count() + ' hidden · ' + (SS_CATALOG.utilities.length - SS.visibility.count()) + ' visible';
  });
  let opener = null;
  function close() {
    panel.hidden = true;
    document.getElementById('ss-scrim').hidden = true;
    const gear = document.getElementById('ss-gear');
    if (gear) gear.setAttribute('aria-expanded','false');
    if (opener) opener.focus();
  }
  function open() {
    if (SS.closeQuickNav) SS.closeQuickNav();
    opener = document.activeElement;
    panel.hidden = false;
    document.getElementById('ss-scrim').hidden = false;
    document.getElementById('ss-gear').setAttribute('aria-expanded','true');
    document.getElementById('settings-search').focus();
  }
  panel.addEventListener('click', function (event) {
    const visibility = event.target.closest('[data-visibility]');
    if (visibility) { SS.visibility.set(visibility.dataset.visibility, !SS.visibility.has(visibility.dataset.visibility)); return; }
    const toggler = event.target.closest('[data-toggle]');
    if (toggler) { rw.set(toggler.dataset.toggle, !rw.get()[toggler.dataset.toggle]); return; }
    const button = event.target.closest('[data-value], [data-accent]');
    if (button) rw.set(button.closest('[data-seg]').dataset.seg, button.hasAttribute('data-accent') ? button.dataset.accent : button.dataset.value);
    if (event.target.closest('[data-close-settings], #ss-close')) close();
    const link = event.target.closest('.rail a');
    if (link) {
      event.preventDefault();
      document.getElementById('settings-search').value = '';
      panel.querySelectorAll('.group').forEach(group => group.hidden = false);
      panel.querySelectorAll('.rail a').forEach(a => a.removeAttribute('aria-current'));
      link.setAttribute('aria-current','true');
      panel.querySelector(link.getAttribute('href')).scrollIntoView({block:'start'});
    }
  });
  document.getElementById('settings-search').addEventListener('input',function () {
    const q = this.value.trim().toLowerCase();
    panel.querySelectorAll('.group').forEach(group => group.hidden = !group.textContent.toLowerCase().includes(q));
  });
  document.getElementById('visibility-search').addEventListener('input',function () {
    const q = this.value.trim().toLowerCase();
    utilityList.querySelectorAll('.visibility-row').forEach(row => row.hidden = !row.textContent.toLowerCase().includes(q));
  });
  document.getElementById('ss-reset').addEventListener('click',function () { rw.reset(); SS.visibility.reset(); SS.toast('Settings reset'); });
  document.getElementById('restore-utilities').addEventListener('click',SS.visibility.reset);
  document.getElementById('ss-scrim').addEventListener('click',close);
  document.addEventListener('keydown',function (event) {
    if (panel.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') SS.trapFocus(panel,event);
  });
  rw.onChange(sync);
  const head = document.querySelector('.topbar__inner');
  head.insertAdjacentHTML('beforeend','<button class="gear" type="button" id="ss-gear" aria-label="Settings" aria-haspopup="dialog" aria-controls="ss-drawer" aria-expanded="false" title="Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/></svg><span>Settings</span></button>');
  document.getElementById('ss-gear').addEventListener('click',open);
  SS.closeSettings = close;
  rw.refresh();
})();
