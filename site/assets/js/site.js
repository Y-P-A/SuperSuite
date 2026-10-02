/* Shared shell: header, footer, catalog rendering and small UI helpers.
   Every page includes this, so navigation stays in one place. */
(function () {
  const SS = (window.SS = window.SS || {});

  const DARK_ICON_TONES = ['t-yellow'];

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
          '<span>Build 0.5.5 (Beta 5) · <a href="/utilities/">Utilities</a> · <a href="/games/">Games</a></span>' +
        '</div>' +
      '</footer>'
    );
  }

  function cardHTML(item) {
    const dark = DARK_ICON_TONES.indexOf(item.tone) > -1 ? ' card__icon--dark' : '';
    const icon = item.icon || item.glyph || '';
    return (
      '<a class="card ' + item.tone + '" href="' + item.href + '">' +
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
    ['settings', 'quick-nav'].forEach(function (name) {
      const tag = document.createElement('script');
      tag.src = '/assets/js/' + name + '.js';
      document.head.appendChild(tag);
    });
  }

  function mount() {
    document.body.insertAdjacentHTML('afterbegin', headerHTML());
    document.body.insertAdjacentHTML('beforeend', footerHTML());

    const catalog = window.SS_CATALOG || { utilities: [], games: [] };
    document.querySelectorAll('[data-catalog]').forEach(function (el) {
      const list = catalog[el.getAttribute('data-catalog')] || [];
      el.innerHTML = list.map(cardHTML).join('');
    });

    mountPage();
    SS.wireCopyButtons(document);
    mountSettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
