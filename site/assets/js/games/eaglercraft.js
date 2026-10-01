/* Eaglercraft launcher: one iframe, four versions, remembered between visits. */
(function () {
  const STORE_KEY = 'supersuite.eaglercraft.version';

  const VERSIONS = {
    '1.5.2': { url: 'https://gx-launcher.github.io/game/1.5.2/index.html', heavy: false },
    '1.8.8': { url: 'https://gx-launcher.github.io/game/1.8.8-wasm/index.html', heavy: false },
    '1.12.2': { url: 'https://gx-launcher.github.io/game/1.12.2-wasm/index.html', heavy: false },
    '1.16.5': { url: 'https://gx-launcher.github.io/game/1.16.5-wasm/index.html', heavy: true }
  };

  const frame = document.getElementById('game');
  const holder = document.getElementById('frame');
  const currentEl = document.getElementById('current');
  const warningEl = document.getElementById('heavy-warning');
  const openTab = document.getElementById('open-tab');

  let active = '1.8.8';

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
    currentEl.textContent = version;
    openTab.href = entry.url;
    warningEl.hidden = !entry.heavy;
    document.querySelectorAll('[data-version]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-version') === version);
    });
    try { localStorage.setItem(STORE_KEY, version); } catch (err) { /* ignore */ }
  }

  document.getElementById('versions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-version]');
    if (button) select(button.getAttribute('data-version'));
  });

  document.getElementById('reload').addEventListener('click', () => {
    frame.src = 'about:blank';
    setTimeout(() => select(active), 60);
    SS.toast('Reloading ' + active);
  });

  document.getElementById('fullscreen').addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (holder.requestFullscreen) holder.requestFullscreen();
    else SS.toast('Fullscreen is not available here');
  });

  select(stored() || active);
})();
