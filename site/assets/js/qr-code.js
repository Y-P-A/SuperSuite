/* QR code generator.
   Uses Kazuhiko Arase's MIT-licensed encoder (site/vendor/qrcode.js) and draws
   the module matrix to a canvas itself, so the output is pixel-crisp and always
   keeps a real quiet zone. */
(function () {
  const canvas = document.getElementById('qr');
  const ctx = canvas.getContext('2d');
  const contentEl = document.getElementById('content');
  const ecEl = document.getElementById('ec');
  const scaleEl = document.getElementById('scale');
  const marginEl = document.getElementById('margin');
  const scaleVal = document.getElementById('scale-val');
  const marginVal = document.getElementById('margin-val');
  const fgEl = document.getElementById('fg');
  const bgEl = document.getElementById('bg');
  const countEl = document.getElementById('count');
  const metaEl = document.getElementById('meta');
  const warnEl = document.getElementById('warn');

  if (typeof qrcode !== 'function') {
    metaEl.textContent = 'The QR encoder did not load.';
    return;
  }

  if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
  }

  let model = null; // { count, isDark(row,col), version }

  /* The encoder throws plain strings, so read both shapes. */
  function isOverflow(err) {
    const message = typeof err === 'string' ? err : (err && err.message) || '';
    return String(message).toLowerCase().indexOf('code length overflow') !== -1;
  }

  /* Pick the smallest version that fits the payload. */
  function buildModel(text, ec) {
    let lastError = null;
    for (let version = 1; version <= 40; version++) {
      try {
        const qr = qrcode(version, ec);
        qr.addData(text);
        qr.make();
        const count = qr.getModuleCount();
        return {
          count: count,
          version: version,
          isDark: (row, col) => qr.isDark(row, col)
        };
      } catch (err) {
        lastError = err;
        if (!isOverflow(err)) throw err;
      }
    }
    throw lastError || 'too much data';
  }

  function draw() {
    const text = contentEl.value;
    const ec = ecEl.value;
    const scale = +scaleEl.value;
    const margin = +marginEl.value;
    const dark = fgEl.value;
    const light = bgEl.value;

    scaleVal.textContent = String(scale);
    marginVal.textContent = String(margin);
    countEl.textContent = text.length + (text.length === 1 ? ' character' : ' characters');

    if (!text) {
      model = null;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      metaEl.textContent = 'Type something to generate a code.';
      warnEl.hidden = true;
      return;
    }

    let next = null;
    try {
      next = buildModel(text, ec);
    } catch (err) {
      warnEl.hidden = false;
      warnEl.textContent = 'That is too much data for one QR code. Shorten the text or switch to a lower error correction level.';
      metaEl.textContent = 'No code generated.';
      return;
    }

    model = next;

    const size = (next.count + margin * 2) * scale;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = light;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = dark;
    for (let row = 0; row < next.count; row++) {
      for (let col = 0; col < next.count; col++) {
        if (next.isDark(row, col)) {
          ctx.fillRect((col + margin) * scale, (row + margin) * scale, scale, scale);
        }
      }
    }

    metaEl.textContent =
      'Version ' + next.version + ' \u00b7 ' +
      next.count + '\u00d7' + next.count + ' modules \u00b7 ' +
      size + '\u00d7' + size + ' px \u00b7 correction ' + ec;

    if (margin < 4) {
      warnEl.hidden = false;
      warnEl.textContent = 'Careful: with less than 4 modules of quiet zone some scanners will not read this.';
    } else {
      warnEl.hidden = true;
    }
  }

  function svgMarkup() {
    if (!model) return null;
    const scale = +scaleEl.value;
    const margin = +marginEl.value;
    const size = (model.count + margin * 2) * scale;
    const dark = fgEl.value;
    const light = bgEl.value;

    let path = '';
    for (let row = 0; row < model.count; row++) {
      for (let col = 0; col < model.count; col++) {
        if (model.isDark(row, col)) {
          path += 'M' + ((col + margin) * scale) + ' ' + ((row + margin) * scale) +
            'h' + scale + 'v' + scale + 'h-' + scale + 'z';
        }
      }
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
      '" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges">' +
      '<rect width="' + size + '" height="' + size + '" fill="' + light + '"/>' +
      '<path d="' + path + '" fill="' + dark + '"/>' +
      '</svg>';
  }

  function fileStem() {
    const text = contentEl.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'qr-' + (text.slice(0, 32) || 'code');
  }

  document.getElementById('download-png').addEventListener('click', () => {
    if (!model) {
      SS.toast('Nothing to download yet');
      return;
    }
    canvas.toBlob((blob) => SS.download(fileStem() + '.png', blob), 'image/png');
  });

  document.getElementById('download-svg').addEventListener('click', () => {
    const markup = svgMarkup();
    if (!markup) {
      SS.toast('Nothing to download yet');
      return;
    }
    SS.download(fileStem() + '.svg', new Blob([markup], { type: 'image/svg+xml' }));
  });

  let timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(draw, 120);
  }

  [contentEl, ecEl, scaleEl, marginEl, fgEl, bgEl].forEach((el) => {
    el.addEventListener('input', schedule);
    el.addEventListener('change', schedule);
  });

  draw();
})();
