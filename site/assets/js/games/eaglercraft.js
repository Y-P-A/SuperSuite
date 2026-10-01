/* Eaglercraft launcher: one iframe, a shelf of clients plus the vanilla
   versions, remembered between visits. Everything comes from the GX Launcher
   page, which serves the builds as plain pages that may be framed. */
(function () {
  const STORE_KEY = 'supersuite.eaglercraft.version';
  const BASE = 'https://gx-launcher.github.io/game/';

  const VERSIONS = {
    astra: { label: 'Astra Client 1.8.8', url: BASE + 'Astra%20Client/index.html' },
    astra2: { label: 'Astra Client 2 · 1.8.8', url: BASE + 'Astra%20Client%202-1.8.8/index.html' },
    eclipse: { label: 'Eclipse Client · 1.8.8', url: BASE + 'Eclipse%20Client/index.html' },
    resent: { label: 'Resent Client', url: BASE + 'Resent%20Client/index.html' },
    pixel: { label: 'Pixel Client · 1.12.2', url: BASE + 'Pixel%20Client/index.html' },
    larp: { label: 'Larp Client · 1.12.2', url: BASE + 'Larp%20Client%201.12.2/index.html' },
    js152: { label: '1.5.2 · JS', url: BASE + '1.5.2/index.html' },
    js188: { label: '1.8.8 · JS', url: BASE + '1.8.8/index.html' },
    js1122: { label: '1.12.2 · JS', url: BASE + '1.12.2/index.html' },
    js1165: { label: '1.16.5 · JS', url: BASE + '1.16.5/index.html', heavy: true },
    wasm188: { label: '1.8.8 · WASM', url: BASE + '1.8.8-wasm/index.html' },
    wasm1122: { label: '1.12.2 · WASM', url: BASE + '1.12.2-wasm/index.html' },
    wasm1165: { label: '1.16.5 · WASM', url: BASE + '1.16.5-wasm/index.html', heavy: true }
  };

  const frame = document.getElementById('game');
  const holder = document.getElementById('frame');
  const currentEl = document.getElementById('current');
  const warningEl = document.getElementById('heavy-warning');

  let active = 'astra';

  function stored() {
    try {
      const value = localStorage.getItem(STORE_KEY);
      return VERSIONS[value] ? value : null;
    } catch (err) {
      return null;
    }
  }

  function select(version) {
    const entry = VERSIONS[version];
    if (!entry) return;
    active = version;
    frame.src = entry.url;
    currentEl.textContent = entry.label;
    warningEl.hidden = !entry.heavy;
    document.querySelectorAll('[data-version]').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-version') === version);
    });
    try { localStorage.setItem(STORE_KEY, version); } catch (err) { /* ignore */ }
  }

  document.querySelectorAll('#versions, #versions-vanilla').forEach(function (grid) {
    grid.addEventListener('click', function (event) {
      const button = event.target.closest('[data-version]');
      if (button) select(button.getAttribute('data-version'));
    });
  });

  document.getElementById('reload').addEventListener('click', function () {
    frame.src = 'about:blank';
    setTimeout(function () { select(active); }, 60);
    SS.toast('Reloading ' + VERSIONS[active].label);
  });

  document.getElementById('fullscreen').addEventListener('click', function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (holder.requestFullscreen) holder.requestFullscreen();
    else SS.toast('Fullscreen is not available here');
  });

  select(stored() || active);
})();
