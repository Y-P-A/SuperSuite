/* Image Converter: images <-> PNG / JPG / PDF, and PDF pages -> images.

   Images are rasterised through a canvas. PDFs are rendered with the vendored
   pdf.js. PDF output is written by hand: a tiny PDF holding each page's JPEG
   with the DCTDecode filter, so no PDF library is needed. */
(function () {
  const MIME = { png: 'image/png', jpg: 'image/jpeg', pdf: 'application/pdf' };
  const PAGE_W = 595.28; /* A4 in points */
  const PAGE_H = 841.89;
  const MARGIN = 24;

  const input = document.getElementById('files');
  const drop = document.getElementById('drop');
  const formatEl = document.getElementById('format');
  const qualityEl = document.getElementById('quality');
  const qualityVal = document.getElementById('quality-val');
  const qualityField = document.getElementById('quality-field');
  const backgroundEl = document.getElementById('background');
  const backgroundField = document.getElementById('background-field');
  const sizeEl = document.getElementById('size');
  const convertBtn = document.getElementById('convert');
  const clearBtn = document.getElementById('clear');
  const statusEl = document.getElementById('status');
  const summaryEl = document.getElementById('summary');
  const outputsEl = document.getElementById('outputs');

  let files = [];
  let outputUrls = [];

  function isPdf(file) {
    return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  }

  function baseName(name) {
    return name.replace(/\.[^.]+$/, '') || 'output';
  }

  function pretty(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  function label() {
    const format = formatEl.value;
    return format === 'jpg' ? 'JPG' : format.toUpperCase();
  }

  /* ---------- canvas helpers ---------- */

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Could not read ' + file.name)); };
      img.src = url;
    });
  }

  function fit(w, h, longest) {
    if (!longest || Math.max(w, h) <= longest) return { width: Math.round(w), height: Math.round(h) };
    const k = longest / Math.max(w, h);
    return { width: Math.max(1, Math.round(w * k)), height: Math.max(1, Math.round(h * k)) };
  }

  /* One canvas per source picture, optionally scaled and flattened onto a
     background colour (null keeps transparency). */
  function rasterize(source, longest, background) {
    const sourceW = source.naturalWidth || source.width;
    const sourceH = source.naturalHeight || source.height;
    const size = fit(sourceW, sourceH, longest);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d');
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, size.width, size.height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, size.width, size.height);
    return canvas;
  }

  function toBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('This browser could not write ' + type));
      }, type, quality);
    });
  }

  async function toBytes(canvas, quality) {
    const blob = await toBlob(canvas, MIME.jpg, quality);
    return { bytes: new Uint8Array(await blob.arrayBuffer()), blob: blob };
  }

  /* ---------- PDF writer (JPEG pages, DCTDecode) ---------- */

  function latin1(text) {
    const out = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) & 0xff;
    return out;
  }

  function pad10(n) {
    return String(n).padStart(10, '0');
  }

  /* pages: [{ bytes: Uint8Array, width, height }] (pixel dimensions) */
  function buildPdf(pages) {
    const objects = [];
    const pageIds = [];
    const contentIds = [];
    const imageIds = [];

    pages.forEach(function (page, i) {
      pageIds.push(3 + i * 3);
      contentIds.push(4 + i * 3);
      imageIds.push(5 + i * 3);
    });

    objects[1] = ['<< /Type /Catalog /Pages 2 0 R >>'];
    objects[2] = ['<< /Type /Pages /Kids [' + pageIds.map(function (id) { return id + ' 0 R'; }).join(' ')
      + '] /Count ' + pages.length + ' >>'];

    pages.forEach(function (page, i) {
      const landscape = page.width > page.height;
      const sheetW = landscape ? PAGE_H : PAGE_W;
      const sheetH = landscape ? PAGE_W : PAGE_H;
      const scale = Math.min((sheetW - MARGIN * 2) / page.width, (sheetH - MARGIN * 2) / page.height);
      const drawW = page.width * scale;
      const drawH = page.height * scale;
      const x = (sheetW - drawW) / 2;
      const y = (sheetH - drawH) / 2;
      const content = 'q ' + drawW.toFixed(2) + ' 0 0 ' + drawH.toFixed(2) + ' '
        + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /Im' + i + ' Do Q';

      objects[pageIds[i]] = [
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + sheetW.toFixed(2) + ' ' + sheetH.toFixed(2) + '] ' +
        '/Resources << /XObject << /Im' + i + ' ' + imageIds[i] + ' 0 R >> >> ' +
        '/Contents ' + contentIds[i] + ' 0 R >>'
      ];
      objects[contentIds[i]] = ['<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream'];
      objects[imageIds[i]] = [
        '<< /Type /XObject /Subtype /Image /Width ' + page.width + ' /Height ' + page.height +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + page.bytes.length +
        ' >>\nstream\n',
        page.bytes,
        '\nendstream'
      ];
    });

    const chunks = [];
    let offset = 0;
    const offsets = [];

    function add(chunk) {
      chunks.push(chunk);
      offset += chunk.length;
    }

    add(latin1('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n'));
    for (let id = 1; id < objects.length; id++) {
      offsets[id] = offset;
      add(latin1(id + ' 0 obj\n'));
      objects[id].forEach(function (chunk) {
        add(typeof chunk === 'string' ? latin1(chunk) : chunk);
      });
      add(latin1('\nendobj\n'));
    }

    const startxref = offset;
    let xref = 'xref\n0 ' + objects.length + '\n0000000000 65535 f \n';
    for (let id = 1; id < objects.length; id++) xref += pad10(offsets[id]) + ' 00000 n \n';
    add(latin1(xref));
    add(latin1('trailer\n<< /Size ' + objects.length + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n'));

    return new Blob(chunks, { type: MIME.pdf });
  }

  /* ---------- reading PDFs ---------- */

  function pdfLib() {
    const lib = window.pdfjsLib;
    if (!lib) throw new Error('The PDF reader did not load');
    lib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.js';
    return lib;
  }

  async function pdfCanvases(file, longest) {
    const lib = pdfLib();
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await lib.getDocument({ data: data, isEvalSupported: false }).promise;
    const canvases = [];

    for (let number = 1; number <= doc.numPages; number++) {
      statusEl.textContent = 'Rendering ' + file.name + ' — page ' + number + ' of ' + doc.numPages + '…';
      const page = await doc.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const scale = longest ? longest / Math.max(base.width, base.height) : 2;
      const viewport = page.getViewport({ scale: scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: viewport, background: '#ffffff' }).promise;
      canvases.push(canvas);
    }

    doc.destroy();
    return canvases;
  }

  /* ---------- conversion ---------- */

  function clearOutputs() {
    outputUrls.forEach(function (url) { URL.revokeObjectURL(url); });
    outputUrls = [];
    outputsEl.innerHTML = '';
  }

  function showOutput(name, blob, note) {
    const url = URL.createObjectURL(blob);
    outputUrls.push(url);

    const item = document.createElement('div');
    item.className = 'out-item';

    const thumb = document.createElement(blob.type === MIME.pdf ? 'span' : 'img');
    if (blob.type === MIME.pdf) {
      thumb.className = 'out-item__file mono';
      thumb.textContent = 'PDF';
    } else {
      thumb.src = url;
      thumb.alt = name;
    }

    const body = document.createElement('div');
    body.className = 'out-item__body';
    const title = document.createElement('strong');
    title.textContent = name;
    const meta = document.createElement('span');
    meta.className = 'small muted';
    meta.textContent = note + ' · ' + pretty(blob.size);
    body.appendChild(title);
    body.appendChild(meta);

    const link = document.createElement('a');
    link.className = 'btn';
    link.href = url;
    link.download = name;
    link.textContent = 'Download';
    if (blob.type === MIME.pdf) {
      const open = document.createElement('a');
      open.className = 'btn';
      open.href = url;
      open.target = '_blank';
      open.rel = 'noopener';
      open.textContent = 'Open';
      const pair = document.createElement('div');
      pair.className = 'btn-row';
      pair.appendChild(link);
      pair.appendChild(open);
      item.appendChild(thumb);
      item.appendChild(body);
      item.appendChild(pair);
    } else {
      item.appendChild(thumb);
      item.appendChild(body);
      item.appendChild(link);
    }

    outputsEl.appendChild(item);
  }

  async function convert() {
    if (!files.length) return;

    const format = formatEl.value;
    const quality = Number(qualityEl.value) / 100;
    const longest = Number(sizeEl.value);
    const opaque = format !== 'png';
    const background = opaque ? backgroundEl.value : null;

    setBusy(true);
    clearOutputs();

    try {
      const pages = [];

      for (const file of files) {
        statusEl.textContent = 'Reading ' + file.name + '…';
        if (isPdf(file)) {
          const canvases = await pdfCanvases(file, longest);
          canvases.forEach(function (canvas, index) {
            pages.push({
              canvas: canvas,
              name: baseName(file.name) + '-page-' + (index + 1) + '.' + (format === 'pdf' ? 'pdf' : format),
              source: file.name
            });
          });
        } else {
          const image = await loadImage(file);
          pages.push({
            canvas: rasterize(image, longest, background),
            name: baseName(file.name) + '.' + (format === 'pdf' ? 'pdf' : format),
            source: file.name
          });
        }
      }

      if (format === 'pdf') {
        statusEl.textContent = 'Building the PDF…';
        const encoded = [];
        for (const page of pages) {
          const jpeg = await toBytes(page.canvas, quality);
          encoded.push({ bytes: jpeg.bytes, width: page.canvas.width, height: page.canvas.height });
        }
        const name = (files.length === 1 ? baseName(files[0].name) : 'supersuite-images') + '.pdf';
        showOutput(name, buildPdf(encoded), pages.length + (pages.length === 1 ? ' page' : ' pages'));
        summaryEl.textContent = pages.length + (pages.length === 1 ? ' page' : ' pages') + ' written into ' + name + '.';
      } else {
        for (const page of pages) {
          statusEl.textContent = 'Writing ' + page.name + '…';
          const blob = await toBlob(page.canvas, MIME[format], quality);
          showOutput(page.name, blob, page.canvas.width + ' × ' + page.canvas.height + ' px');
        }
        summaryEl.textContent = pages.length + (pages.length === 1 ? ' file' : ' files') + ' converted to ' + label() + '.';
      }

      statusEl.textContent = 'Done — ' + pages.length + (pages.length === 1 ? ' file' : ' files') + ' converted.';
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      statusEl.textContent = message;
      summaryEl.textContent = 'That one could not be converted: ' + message;
    } finally {
      setBusy(false);
    }
  }

  /* ---------- wiring ---------- */

  function setBusy(busy) {
    convertBtn.disabled = busy || !files.length;
    clearBtn.disabled = busy || !files.length;
    convertBtn.textContent = busy ? 'Working…' : 'Convert';
  }

  function setFiles(list) {
    files = Array.prototype.slice.call(list || []);
    clearOutputs();
    if (!files.length) {
      statusEl.textContent = 'Waiting for a file.';
      summaryEl.textContent = 'Nothing converted yet.';
    } else {
      statusEl.textContent = files.length + (files.length === 1 ? ' file' : ' files') + ' ready — press Convert.';
      summaryEl.textContent = files.map(function (file) { return file.name; }).join(', ');
    }
    setBusy(false);
  }

  function syncOptions() {
    const format = formatEl.value;
    qualityField.hidden = format === 'png';
    backgroundField.hidden = format === 'png';
    qualityVal.textContent = qualityEl.value;
    convertBtn.textContent = 'Convert to ' + label();
  }

  input.addEventListener('change', function () { setFiles(input.files); });

  drop.addEventListener('dragover', function (event) {
    event.preventDefault();
    drop.classList.add('is-over');
  });
  drop.addEventListener('dragleave', function () { drop.classList.remove('is-over'); });
  drop.addEventListener('drop', function (event) {
    event.preventDefault();
    drop.classList.remove('is-over');
    if (event.dataTransfer && event.dataTransfer.files.length) setFiles(event.dataTransfer.files);
  });

  formatEl.addEventListener('change', syncOptions);
  qualityEl.addEventListener('input', syncOptions);

  convertBtn.addEventListener('click', convert);
  clearBtn.addEventListener('click', function () {
    input.value = '';
    setFiles([]);
  });

  syncOptions();
})();
