/* Hash Generator — digests via the Web Crypto API, no fallbacks needed in any
   browser that can run the rest of the site. */
(function () {
  const text = document.getElementById('text');
  const status = document.getElementById('status');
  const algorithms = ['SHA-1', 'SHA-256', 'SHA-512'];
  const ids = { 'SHA-1': 'sha1', 'SHA-256': 'sha256', 'SHA-512': 'sha512' };
  let token = 0;

  function toHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('');
  }

  async function update() {
    if (!window.crypto || !window.crypto.subtle) {
      status.hidden = false;
      status.className = 'warn';
      status.textContent = 'This browser will not give the page access to crypto — open the site over https or localhost.';
      return;
    }
    status.hidden = true;
    const run = ++token;
    const bytes = new TextEncoder().encode(text.value);
    for (const algorithm of algorithms) {
      const digest = await crypto.subtle.digest(algorithm, bytes);
      if (run !== token) return; // a newer keystroke already won
      document.getElementById(ids[algorithm]).textContent = toHex(digest);
    }
  }

  text.addEventListener('input', update);
  document.querySelector('[data-copy-target]') &&
    document.getElementById('algorithms').addEventListener('click', function (event) {
      const button = event.target.closest('[data-copy-target]');
      if (!button) return;
      const value = document.getElementById(button.getAttribute('data-copy-target')).textContent;
      if (value) SS.copy(value);
    });

  update();
})();
