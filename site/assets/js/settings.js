/* The settings drawer: the gear button in the header opens a panel holding
   Rewind (the era picker) plus every appearance toggle. State lives in
   rewind.js; this file is only the UI. */
(function () {
  const SS = (window.SS = window.SS || {});
  if (!SS.rewind || document.querySelector('.drawer')) return;

  const rw = SS.rewind;
  const opt = rw.options;
  let built = false;

  const GEAR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="3.2"/>' +
    '<path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>' +
    '</svg>';

  function esc(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function titleCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function seg(key) {
    return '<div class="seg" data-seg="' + key + '">' +
      opt[key].map(function (value) {
        return '<button type="button" data-value="' + esc(value) + '">' + esc(titleCase(value)) + '</button>';
      }).join('') +
      '</div>';
  }

  function toggle(key, label, hint) {
    return '<div class="set-row">' +
      '<div class="set-row__head"><span class="label">' + esc(label) + '</span>' +
      '<div class="seg" data-seg="' + key + '">' +
        '<button type="button" data-value="on">On</button>' +
        '<button type="button" data-value="off">Off</button>' +
      '</div></div>' +
      (hint ? '<p class="set-hint">' + esc(hint) + '</p>' : '') +
      '</div>';
  }

  function swatches() {
    return '<div class="swatches" data-seg="accent">' +
      opt.accent.map(function (color) {
        return '<button type="button" data-accent="' + esc(color) + '"' +
          (color ? ' style="background:' + esc(color) + '"' : '') +
          ' aria-label="' + (color || 'era default') + '"></button>';
      }).join('') +
      '</div>';
  }

  function drawerHTML() {
    return (
      '<div class="scrim" id="ss-scrim"></div>' +
      '<aside class="drawer" id="ss-drawer" role="dialog" aria-modal="true" aria-label="Settings">' +
        '<div class="drawer__head">' +
          '<h2>Settings</h2>' +
          '<button class="btn" type="button" id="ss-close">Close</button>' +
        '</div>' +
        '<div class="drawer__body">' +

          '<div class="set-group">' +
            '<span class="label">Rewind — change the look</span>' +
            '<div class="rewind-grid" data-seg="rewind">' +
              opt.rewind.map(function (era) {
                return '<button class="rewind-pick" type="button" data-value="' + era.value + '">' +
                  '<span class="rewind-pick__swatch rw-' + era.value + '"></span>' +
                  era.label + '<small>' + era.hint + '</small>' +
                '</button>';
              }).join('') +
            '</div>' +
            '<p class="set-hint" style="margin-top:10px">Rewind restyles the whole site — colours, type, corners and all the little details.</p>' +
          '</div>' +

          '<div class="set-group">' +
            '<span class="label">Accent color</span>' +
            swatches() +
          '</div>' +

          '<div class="set-group">' +
            '<span class="label">Layout</span>' +
            '<div class="set-row"><div class="set-row__head"><span class="label">Density</span></div>' + seg('density') + '</div>' +
            '<div class="set-row"><div class="set-row__head"><span class="label">Corners</span></div>' + seg('corners') + '</div>' +
            '<div class="set-row"><div class="set-row__head"><span class="label">Text size</span></div>' + seg('scale') + '</div>' +
            '<div class="set-row"><div class="set-row__head"><span class="label">Cards</span></div>' + seg('cards') + '</div>' +
            '<div class="set-row"><div class="set-row__head"><span class="label">Page width</span></div>' + seg('width') + '</div>' +
          '</div>' +

          '<div class="set-group">' +
            '<span class="label">Effects</span>' +
            toggle('glow', 'Neon glow', 'Make the accent light up the cards and buttons.') +
            toggle('scanlines', 'CRT scanlines', 'A retro overlay across the whole page.') +
            toggle('motion', 'Animations', 'Turn off for a still, instant feel.') +
            toggle('opaque', 'Solid surfaces', 'Drop the blur and translucency.') +
            toggle('clock', 'Header clock', 'Show the time in the top bar.') +
          '</div>' +

          '<div class="set-group">' +
            '<span class="label">Your experience</span>' +
            '<div class="set-row"><span class="label">Reading font</span>' + seg('font') + '</div>' +
            '<div class="set-row"><span class="label">Line spacing</span>' + seg('reading') + '</div>' +
            '<div class="set-row"><span class="label">Clock format</span>' + seg('clockFormat') + '</div>' +
            toggle('descriptions', 'Card descriptions', 'Show explanations in the utility and game catalogs.') +
            toggle('tags', 'Catalog tags', 'Show utility and game numbers on cards.') +
            toggle('decorations', 'Hero decorations', 'Show decorative shapes on the home page.') +
            toggle('stickyHeader', 'Keep header visible', 'Keep navigation at the top while scrolling.') +
            toggle('footer', 'Footer', 'Show the footer at the bottom of each page.') +
          '</div>' +
          '<p class="set-hint">Build 0.5 (Beta 5) · Settings stay in this browser.</p>' +
          '<button class="btn btn--block" type="button" id="ss-reset">Reset everything</button>' +
        '</div>' +
      '</aside>'
    );
  }

  function sync() {
    const settings = rw.get();
    document.querySelectorAll('[data-seg]').forEach(function (group) {
      const key = group.getAttribute('data-seg');
      if (key === 'accent') {
        group.querySelectorAll('button').forEach(function (button) {
          button.classList.toggle('is-on', button.getAttribute('data-accent') === settings.accent);
        });
        return;
      }
      const value = key === 'motion' ? (settings.motion ? 'on' : 'off')
        : key === 'glow' ? (settings.glow ? 'on' : 'off')
        : key === 'scanlines' ? (settings.scanlines ? 'on' : 'off')
        : key === 'opaque' ? (settings.opaque ? 'on' : 'off')
        : key === 'clock' ? (settings.clock ? 'on' : 'off')
        : typeof settings[key] === 'boolean' ? (settings[key] ? 'on' : 'off')
        : settings[key];
      group.querySelectorAll('[data-value]').forEach(function (button) {
        button.classList.toggle('is-on', button.getAttribute('data-value') === value);
      });
    });
  }

  function open() {
    document.getElementById('ss-drawer').classList.add('is-open');
    document.getElementById('ss-scrim').classList.add('is-open');
  }

  function close() {
    document.getElementById('ss-drawer').classList.remove('is-open');
    document.getElementById('ss-scrim').classList.remove('is-open');
  }

  function build() {
    if (built) return;
    built = true;

    document.body.insertAdjacentHTML('beforeend', drawerHTML());

    document.querySelector('.drawer__body').addEventListener('click', function (event) {
      const group = event.target.closest('[data-seg]');
      if (!group) return;
      const key = group.getAttribute('data-seg');

      if (key === 'accent') {
        const button = event.target.closest('[data-accent]');
        if (!button) return;
        rw.set('accent', button.getAttribute('data-accent'));
        return;
      }

      const button = event.target.closest('[data-value]');
      if (!button) return;
      const value = button.getAttribute('data-value');
      if (value === 'on' || value === 'off') rw.set(key, value === 'on');
      else rw.set(key, value);
    });

    document.getElementById('ss-close').addEventListener('click', close);
    document.getElementById('ss-scrim').addEventListener('click', close);
    document.getElementById('ss-reset').addEventListener('click', function () {
      rw.reset();
      SS.toast && SS.toast('Settings reset');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    rw.onChange(sync);

    const gear = document.getElementById('ss-gear');
    if (gear) gear.addEventListener('click', open);
  }

  function mount() {
    build();
    const head = document.querySelector('.topbar__inner');
    if (head && !document.getElementById('ss-gear')) {
      head.insertAdjacentHTML('beforeend',
        '<button class="gear" type="button" id="ss-gear" aria-label="Settings" title="Settings">' +
        GEAR + '<span>Settings</span></button>');
      document.getElementById('ss-gear').addEventListener('click', open);
    }
    /* The clock element lives in the shell, so refresh it once it exists. */
    rw.refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
