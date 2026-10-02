/* Encoder / decoder: Base64, URL, HTML entities, hex and ROT13.
   Base64 and hex read the text as UTF-8 so accents and emoji survive. */
(function () {
  const MODES = [
    {
      id: 'base64',
      label: 'Base64',
      hint: 'Base64 turns any text into plain letters and numbers — handy for tokens and data URLs.',
      encode: function (text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        bytes.forEach(function (byte) { binary += String.fromCharCode(byte); });
        return btoa(binary);
      },
      decode: function (text) {
        const binary = atob(text.replace(/\s+/g, ''));
        const bytes = Uint8Array.from(binary, function (char) { return char.charCodeAt(0); });
        return new TextDecoder().decode(bytes);
      }
    },
    {
      id: 'url',
      label: 'URL',
      hint: 'URL encoding swaps spaces and symbols for % escapes so a value can live in a query string.',
      encode: function (text) { return encodeURIComponent(text); },
      decode: function (text) { return decodeURIComponent(text); }
    },
    {
      id: 'html',
      label: 'HTML entities',
      hint: 'HTML entities keep < > and quotes from being read as markup when you paste text into a page.',
      encode: function (text) {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      },
      decode: function (text) {
        const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
        return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, function (match, body) {
          if (body.charAt(0) === '#') {
            const hex = body.charAt(1).toLowerCase() === 'x';
            const code = parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
            return isFinite(code) ? String.fromCodePoint(code) : match;
          }
          const lower = body.toLowerCase();
          return named[lower] !== undefined ? named[lower] : match;
        });
      }
    },
    {
      id: 'hex',
      label: 'Hex',
      hint: 'Hex shows the raw UTF-8 bytes of your text, two digits per byte.',
      encode: function (text) {
        return Array.from(new TextEncoder().encode(text)).map(function (byte) {
          return byte.toString(16).padStart(2, '0');
        }).join(' ');
      },
      decode: function (text) {
        const clean = text.replace(/[^0-9a-f]/gi, '');
        if (clean.length % 2) throw new Error('Hex needs an even number of digits.');
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
        return new TextDecoder().decode(bytes);
      }
    },
    {
      id: 'binary',
      label: 'Binary',
      hint: 'Binary shows the same UTF-8 bytes as 8-bit groups of ones and zeros.',
      encode: function (text) {
        return Array.from(new TextEncoder().encode(text)).map(function (byte) {
          return byte.toString(2).padStart(8, '0');
        }).join(' ');
      },
      decode: function (text) {
        const bits = text.replace(/[^01]/g, '');
        if (bits.length % 8) throw new Error('Binary needs a multiple of eight bits.');
        const bytes = new Uint8Array(bits.length / 8);
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
        return new TextDecoder().decode(bytes);
      }
    },
    {
      id: 'morse',
      label: 'Morse',
      hint: 'Morse code writes letters as dots and dashes — a space between letters, a slash between words.',
      encode: function (text) {
        return text.toUpperCase().split('').map(function (char) {
          if (char === ' ') return '/';
          return MORSE[char] || '';
        }).filter(Boolean).join(' ');
      },
      decode: function (text) {
        return text.trim().split(/\s+/).map(function (token) {
          if (token === '/') return ' ';
          const found = Object.keys(MORSE).filter(function (key) { return MORSE[key] === token; })[0];
          return found || '?';
        }).join('');
      }
    },
    {
      id: 'rot13',
      label: 'ROT13',
      hint: 'ROT13 shifts every letter by 13 — the classic spoiler-safe scramble. Decoding is the same shift.',
      encode: function (text) { return rot13(text); },
      decode: function (text) { return rot13(text); }
    }
  ];

  const MORSE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
    J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
    S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
    6: '-....', 7: '--...', 8: '---..', 9: '----.'
  };

  function rot13(text) {
    return text.replace(/[a-z]/gi, function (char) {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode((char.charCodeAt(0) - base + 13) % 26 + base);
    });
  }

  const modesEl = document.getElementById('modes');
  const hintEl = document.getElementById('hint');
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const errorEl = document.getElementById('error');

  let active = MODES[0];

  function renderModes() {
    modesEl.innerHTML = MODES.map(function (mode) {
      return '<option value="' + mode.id + '">' + mode.label + '</option>';
    }).join('');
    modesEl.value = active.id;
    hintEl.textContent = active.hint;
  }

  function run(direction) {
    const text = inputEl.value;
    if (!text) {
      outputEl.textContent = '—';
      errorEl.hidden = true;
      return;
    }
    try {
      outputEl.textContent = active[direction](text);
      errorEl.hidden = true;
    } catch (error) {
      errorEl.hidden = false;
      errorEl.textContent = 'That could not be ' + (direction === 'encode' ? 'encoded' : 'decoded') + ' as ' +
        active.label + ' — ' + (error.message || String(error));
      outputEl.textContent = '—';
    }
  }

  modesEl.addEventListener('change', function (event) {
    active = MODES.find(function (mode) { return mode.id === event.target.value; });
    renderModes();
    run('encode');
  });

  document.getElementById('encode').addEventListener('click', function () { run('encode'); });
  document.getElementById('decode').addEventListener('click', function () { run('decode'); });

  document.getElementById('copy').addEventListener('click', function () {
    const text = outputEl.textContent;
    if (!text || text === '—') {
      SS.toast('Nothing to copy yet');
      return;
    }
    SS.copy(text);
  });

  document.getElementById('swap').addEventListener('click', function () {
    const text = outputEl.textContent;
    if (!text || text === '—') return;
    inputEl.value = text;
    run('encode');
  });

  document.getElementById('clear').addEventListener('click', function () {
    inputEl.value = '';
    outputEl.textContent = '—';
    errorEl.hidden = true;
    inputEl.focus();
  });

  renderModes();
  document.getElementById('encode').click();
})();
