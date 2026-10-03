/* Shared shell: header, footer, catalog rendering and small UI helpers.
   Every page includes this, so navigation stays in one place. */
(function () {
  const SS = (window.SS = window.SS || {});

  const DARK_ICON_TONES = ['t-yellow'];

  SS.trapFocus = function (panel, event) {
    const controls = Array.from(panel.querySelectorAll('button, a, input, select, textarea')).filter(el => !el.disabled && el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  function loadScript(name) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script'); script.src = '/assets/js/' + name + '.js';
      script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
    });
  }

  function headerHTML() {
    const links = '<a class="home-shortcut" id="ss-home" href="/" aria-label="Home" aria-haspopup="dialog" aria-controls="ss-quick-nav" aria-expanded="false" title="Home · right-click or hold for quick navigation">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 10 9-7 9 7v10H15v-6H9v6H3z"/></svg></a>';
    return (
      '<header class="topbar">' +
        '<div class="topbar__inner">' +
          '<a class="brand" href="/"><span class="brand__mark">S</span>Super<span class="brand--accent">Suite</span></a>' +
          '<nav class="nav" aria-label="Main">' + links + '</nav>' +
          '<span class="clock" id="ss-clock" hidden></span>' +
        '</div>' +
      '</header>'
    );
  }

  function footerHTML() {
    return (
      '<footer class="footer">' +
        '<div class="footer__inner">' +
          '<span>SuperSuite — handpicked utilities and unblocked games. No login, ever.</span>' +
          '<span>Build 0.8 (Beta 8) · <a href="/utilities/">Utilities</a> · <a href="/games/">Games</a></span>' +
        '</div>' +
      '</footer>'
    );
  }

  function cardHTML(item) {
    const dark = DARK_ICON_TONES.indexOf(item.tone) > -1 ? ' card__icon--dark' : '';
    const icon = item.icon || item.glyph || '';
    return (
      '<a class="card ' + item.tone + (item.main ? ' card--main' : '') + '" href="' + item.href + '">' +
        '<span class="card__stripe"></span>' +
        '<span class="card__body">' +
          '<span class="card__icon' + dark + '" aria-hidden="true">' + icon + '</span>' +
          '<span>' +
            '<h3>' + item.name + '</h3>' +
            '<p>' + item.desc + '</p>' +
          '</span>' +
        '</span>' +
        '<span class="card__tag">' + item.tag + '</span>' +
      '</a>'
    );
  }

  SS.toast = function (message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(SS.toast._timer);
    SS.toast._timer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, 1600);
  };

  SS.copy = function (text) {
    if (window.navigator.clipboard && window.isSecureContext) {
      window.navigator.clipboard.writeText(text).then(
        function () { SS.toast('Copied'); },
        function () { SS.toast('Copy failed'); }
      );
      return;
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    try { document.execCommand('copy'); SS.toast('Copied'); }
    catch (err) { SS.toast('Copy failed'); }
    document.body.removeChild(field);
  };

  /* Wires [data-copy="text"] buttons to the clipboard. */
  SS.wireCopyButtons = function (root) {
    (root || document).addEventListener('click', function (event) {
      const btn = event.target.closest('[data-copy]');
      if (btn) SS.copy(btn.getAttribute('data-copy'));
    });
  };

  SS.download = function (filename, dataUrlOrBlob) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = typeof dataUrlOrBlob === 'string' ? dataUrlOrBlob : URL.createObjectURL(dataUrlOrBlob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof dataUrlOrBlob !== 'string') URL.revokeObjectURL(link.href);
  };

  /* Tool and game pages can declare `data-page="/tools/x"` on <body> instead of
     repeating the back link and panel header by hand — both are built here from
     the catalog entry, so the copy stays in one place. */
  function mountPage() {
    const path = document.body.getAttribute('data-page');
    if (!path) return;
    const catalog = window.SS_CATALOG || { utilities: [], games: [] };
    const item = catalog.utilities.concat(catalog.games).find(function (entry) {
      return entry.href === path;
    });
    if (!item) return;
    document.title = item.name + ' — SuperSuite';

    const panel = document.querySelector('main .panel');
    if (!panel) return;
    if (item.tone && !/\bt-/.test(panel.className)) panel.classList.add(item.tone);
    panel.insertAdjacentHTML('afterbegin',
      '<div class="panel__head">' +
        '<div><h1>' + item.name + '</h1>' +
        '<p class="muted small" data-page-note></p></div>' +
        '<span class="badge">' + item.tag + '</span>' +
      '</div>');
    const note = panel.querySelector('[data-page-note]');
    if (note) note.textContent = document.body.getAttribute('data-note') || item.desc;
  }

  function mountSettings() {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/assets/css/experience.css';
    document.head.appendChild(style);
    const commandStyle = document.createElement('link');
    commandStyle.rel = 'stylesheet'; commandStyle.href = '/assets/css/build08.css';
    document.head.appendChild(commandStyle);
    loadScript('settings');
    loadScript('quick-nav');
  }

  async function mount() {
    const categoryStyle = document.createElement('link');
    categoryStyle.rel = 'stylesheet'; categoryStyle.href = '/assets/css/build07.css';
    document.head.appendChild(categoryStyle);
    if (!window.SS_CATALOG) await loadScript('catalog');
    if (!window.SS_CATALOG.categories) await loadScript('build07/catalog');
    await loadScript('utility-logos');
    await loadScript('customization');
    document.body.insertAdjacentHTML('afterbegin', headerHTML());
    document.body.insertAdjacentHTML('beforeend', footerHTML());

    const catalog = window.SS_CATALOG || { utilities: [], games: [] };
    document.querySelectorAll('[data-catalog]').forEach(function (el) {
      const kind = el.getAttribute('data-catalog');
      const list = catalog[kind] || [];
      if (kind !== 'utilities' || !catalog.categories) { el.innerHTML = list.map(cardHTML).join(''); return; }
      const controls = document.createElement('div'); controls.className = 'catalog-controls';
      controls.innerHTML = '<div class="field"><label for="utility-search">Find a utility</label><input class="input" id="utility-search" type="search" placeholder="Search 150 tools…"></div><div class="field"><label for="utility-category">Category</label><select class="select" id="utility-category"><option value="">All categories</option>' + catalog.categories.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('') + '</select></div><span class="small muted" id="utility-count" role="status">150 utilities</span>';
      el.before(controls);
      el.innerHTML = catalog.categories.map(function (cat) {
        const items = list.filter(item => item.category === cat.id).sort((a,b) => Number(b.main)-Number(a.main) || a.name.localeCompare(b.name));
        return '<section class="utility-category cat-' + cat.id + '" data-category="' + cat.id + '"><div class="utility-category__head"><h2>' + cat.name + '</h2><span>30 utilities · main tool featured</span></div><div class="grid">' + items.map(cardHTML).join('') + '</div></section>';
      }).join('');
      function filter() {
        const q = controls.querySelector('input').value.toLowerCase().trim(), category = controls.querySelector('select').value;
        let count = 0;
        el.querySelectorAll('.utility-category').forEach(function (section) {
          let visible = 0;
          section.querySelectorAll('.card').forEach(function (card) { const show = (!category || category === section.dataset.category) && card.textContent.toLowerCase().includes(q) && (location.pathname !== '/' || !SS.visibility.has(card.getAttribute('href'))); card.hidden = !show; if (show) visible++; });
          section.hidden = !visible; count += visible;
          const featured = section.querySelector('.card--main');
          section.querySelector('.utility-category__head span').textContent = visible + (visible === 1 ? ' utility' : ' utilities') + (featured && !featured.hidden ? ' · main tool featured' : '');
        });
        controls.querySelector('#utility-count').textContent = count + (count === 1 ? ' utility' : ' utilities') + (count ? '' : ' — no matches');
      }
      controls.querySelector('input').addEventListener('input', filter);
      controls.querySelector('select').addEventListener('change', filter);
      SS.visibility.onChange(filter);
    });

    mountPage();
    const utility = catalog.utilities.find(item => item.href === location.pathname.replace(/\.html$/, ''));
    const title = document.querySelector('main .panel h1');
    if (utility && title) title.insertAdjacentHTML('afterbegin', '<span class="utility-mark ' + utility.tone + '" aria-hidden="true">' + utility.icon + '</span>');
    SS.wireCopyButtons(document);
    mountSettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
