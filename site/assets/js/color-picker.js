/* Color picker: HEX / RGB / HSL readouts, tints and shades, recent colors. */
(function () {
  const STORE_KEY = 'supersuite.recentColors';

  const swatch = document.getElementById('swatch');
  const native = document.getElementById('native');
  const hexInput = document.getElementById('hex');
  const sliders = {
    r: document.getElementById('r'),
    g: document.getElementById('g'),
    b: document.getElementById('b')
  };
  const values = {
    r: document.getElementById('r-val'),
    g: document.getElementById('g-val'),
    b: document.getElementById('b-val')
  };
  const outHex = document.getElementById('o-hex');
  const outRgb = document.getElementById('o-rgb');
  const outHsl = document.getElementById('o-hsl');
  const shadesEl = document.getElementById('shades');
  const recentEl = document.getElementById('recent');
  const copyHex = document.getElementById('copy-hex');

  let rgb = { r: 41, g: 128, b: 185 };

  const clamp = (n) => Math.min(255, Math.max(0, Math.round(n)));
  const pad = (n) => clamp(n).toString(16).padStart(2, '0');

  function toHex(c) {
    return '#' + pad(c.r) + pad(c.g) + pad(c.b);
  }

  function toRgbString(c) {
    return 'rgb(' + clamp(c.r) + ', ' + clamp(c.g) + ', ' + clamp(c.b) + ')';
  }

  function toHsl(c) {
    const r = clamp(c.r) / 255;
    const g = clamp(c.g) / 255;
    const b = clamp(c.b) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = h / 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function toHslString(c) {
    const hsl = toHsl(c);
    return 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
  }

  function parseHex(value) {
    const text = String(value).trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(text)) {
      return {
        r: parseInt(text[0] + text[0], 16),
        g: parseInt(text[1] + text[1], 16),
        b: parseInt(text[2] + text[2], 16)
      };
    }
    if (/^[0-9a-f]{6}$/i.test(text)) {
      return {
        r: parseInt(text.slice(0, 2), 16),
        g: parseInt(text.slice(2, 4), 16),
        b: parseInt(text.slice(4, 6), 16)
      };
    }
    return null;
  }

  function mix(c, target, amount) {
    return {
      r: clamp(c.r + (target - c.r) * amount),
      g: clamp(c.g + (target - c.g) * amount),
      b: clamp(c.b + (target - c.b) * amount)
    };
  }

  /* Contrast label so the hex on each swatch stays readable. */
  function textOn(c) {
    const luminance = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
    return luminance > 0.6 ? '#2c3e50' : '#ffffff';
  }

  /* WCAG contrast: reluminance, ratio, and the pass grade for a pair. */
  function relativeLuminance(c) {
    const channel = (v) => {
      const s = clamp(v) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
  }

  function contrastRatio(a, b) {
    const la = relativeLuminance(a);
    const lb = relativeLuminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function grade(ratio) {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA large';
    return 'fails';
  }

  function paintContrast() {
    const whiteEl = document.getElementById('c-white');
    const blackEl = document.getElementById('c-black');
    if (!whiteEl || !blackEl) return;
    const onWhite = contrastRatio(rgb, { r: 255, g: 255, b: 255 });
    const onBlack = contrastRatio(rgb, { r: 0, g: 0, b: 0 });
    whiteEl.textContent = onWhite.toFixed(2) + ':1 · ' + grade(onWhite);
    blackEl.textContent = onBlack.toFixed(2) + ':1 · ' + grade(onBlack);
  }

  function readRecent() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(raw) ? raw.slice(0, 12) : [];
    } catch (err) {
      return [];
    }
  }

  function remember(hex) {
    const list = [hex].concat(readRecent().filter((item) => item !== hex)).slice(0, 12);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (err) { /* ignore */ }
    renderRecent(list);
  }

  function renderRecent(list) {
    const colors = list || readRecent();
    recentEl.innerHTML = '';
    if (!colors.length) {
      recentEl.innerHTML = '<span class="small muted">Colors you pick are saved here.</span>';
      return;
    }
    colors.forEach((hex) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.background = hex;
      btn.title = hex;
      btn.setAttribute('aria-label', 'Use ' + hex);
      btn.addEventListener('click', () => setColor(parseHex(hex)));
      recentEl.appendChild(btn);
    });
  }

  function renderShades() {
    const steps = [];
    [0.15, 0.3, 0.45, 0.6, 0.75].forEach((amount) => steps.push(mix(rgb, { r: 255, g: 255, b: 255 }, amount)));
    [0.15, 0.3, 0.45, 0.6, 0.75].forEach((amount) => steps.push(mix(rgb, { r: 0, g: 0, b: 0 }, amount)));

    shadesEl.innerHTML = '';
    steps.forEach((color) => {
      const hex = toHex(color);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shade';
      btn.style.background = hex;
      btn.style.color = textOn(color);
      btn.textContent = hex.toUpperCase();
      btn.title = 'Use ' + hex;
      btn.addEventListener('click', () => setColor(color));
      shadesEl.appendChild(btn);
    });
  }

  function render(commit) {
    const hex = toHex(rgb);
    const upper = hex.toUpperCase();

    swatch.style.background = hex;
    native.value = hex;
    sliders.r.value = String(rgb.r);
    sliders.g.value = String(rgb.g);
    sliders.b.value = String(rgb.b);
    values.r.textContent = String(rgb.r);
    values.g.textContent = String(rgb.g);
    values.b.textContent = String(rgb.b);
    outHex.textContent = upper;
    outRgb.textContent = toRgbString(rgb);
    outHsl.textContent = toHslString(rgb);
    copyHex.setAttribute('data-copy', upper);
    if (document.activeElement !== hexInput) hexInput.value = hex;

    renderShades();
    paintContrast();
    if (commit) remember(hex);
    document.title = upper + ' — Color Picker — SuperSuite';
  }

  let colorTimer = null;

  function setColor(next, commit) {
    rgb = { r: clamp(next.r), g: clamp(next.g), b: clamp(next.b) };
    render(commit);
  }

  sliders.r.addEventListener('input', () => setColor({ r: +sliders.r.value, g: rgb.g, b: rgb.b }, false));
  sliders.g.addEventListener('input', () => setColor({ r: rgb.r, g: +sliders.g.value, b: rgb.b }, false));
  sliders.b.addEventListener('input', () => setColor({ r: rgb.r, g: rgb.g, b: +sliders.b.value }, false));

  ['change', 'blur'].forEach((type) => {
    sliders.r.addEventListener(type, commitSoon);
    sliders.g.addEventListener(type, commitSoon);
    sliders.b.addEventListener(type, commitSoon);
  });

  function commitSoon() {
    clearTimeout(colorTimer);
    colorTimer = setTimeout(() => remember(toHex(rgb)), 400);
  }

  native.addEventListener('input', () => {
    const parsed = parseHex(native.value);
    if (parsed) setColor(parsed, false);
  });
  native.addEventListener('change', commitSoon);

  hexInput.addEventListener('input', () => {
    const parsed = parseHex(hexInput.value);
    if (parsed) setColor(parsed, false);
  });
  hexInput.addEventListener('change', () => {
    const parsed = parseHex(hexInput.value);
    if (parsed) setColor(parsed, true);
    else hexInput.value = toHex(rgb);
  });

  document.getElementById('random').addEventListener('click', () => {
    setColor({
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    }, true);
  });

  document.getElementById('copy-rgb').addEventListener('click', () => SS.copy(toRgbString(rgb)));
  document.getElementById('copy-hsl').addEventListener('click', () => SS.copy(toHslString(rgb)));
  document.getElementById('copy-css').addEventListener('click', () => SS.copy('color: ' + toHex(rgb).toUpperCase() + ';'));

  renderRecent();
  render(true);
})();
