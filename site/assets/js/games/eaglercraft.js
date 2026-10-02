/* Eaglercraft launcher: one iframe, a grouped dropdown of clients and
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
    wasm1165: { label: '1.16.5 · WASM', url: BASE + '1.16.5-wasm/index.html', heavy: true },
    beta181: { label: 'Beta 1.8.1 · WASM', url: BASE + 'beta-1.8.1-wasm/index.html' },
    js10: { label: '1.0 · JS', url: BASE + '1.0/index.html' },
    wasm123: { label: '1.2.3 · WASM', url: BASE + '1.2.3-wasm/index.html' },
    js164: { label: '1.6.4 · JS', url: BASE + '1.6.4/index.html' },
    wasm1206: { label: '1.20.6 · WASM (modded)', url: BASE + '1.20.6-wasm/index.html', note: 'This is a modded 1.20.6 build.' },
    wasm262: { label: '26.2 · WASM', url: BASE + '26.2-wasm/index.html', note: 'The initial black screen is the loading screen, not a crash. This build is lightweight and heavily based on 1.8.8 — give it time to finish loading.' }
  };

  const frame = document.getElementById('game');
  const holder = document.getElementById('frame');
  const currentEl = document.getElementById('current');
  const warningEl = document.getElementById('heavy-warning');

  const versionEl = document.getElementById('version');
  const noteEl = document.getElementById('version-note');
  const groups = {
    Clients: ['astra', 'astra2', 'eclipse', 'resent', 'pixel', 'larp'],
    'Classic versions': ['beta181', 'js10', 'wasm123', 'js152', 'js164', 'js188', 'wasm188', 'js1122', 'wasm1122', 'js1165', 'wasm1165'],
    'Modded builds': ['wasm1206', 'wasm262']
  };
  Object.keys(groups).forEach(function (label) {
    const group = document.createElement('optgroup');
    group.label = label;
    groups[label].forEach(function (id) { group.appendChild(new Option(VERSIONS[id].label, id)); });
    versionEl.appendChild(group);
  });

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
    versionEl.value = version;
    noteEl.textContent = entry.note || ({
      astra: 'Recommended — the best all-round client.',
      astra2: 'Newer Astra build.', eclipse: 'Tuned for PvP.', resent: 'Light and smooth.',
      pixel: 'Client for 1.12.2.', larp: 'Another 1.12.2 pick.',
      js152: 'Lightest — runs on almost anything.', js188: 'PvP classic, no WASM needed.',
      wasm188: 'Faster 1.8.8 for modern devices.', js1122: 'More blocks, more world.',
      wasm1122: 'Smoother 1.12.2.', js1165: 'Newest vanilla content — heavy.',
      wasm1165: 'Newest and heaviest vanilla build.'
    }[version] || 'Click inside the game after it loads to grab mouse control.');
    try { localStorage.setItem(STORE_KEY, version); } catch (err) { /* ignore */ }
  }

  versionEl.addEventListener('change', function (event) {
    select(event.target.value);
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
