/* Crazy text filters: mock, uwu, script, bubble, small caps, fullwidth,
   upside down, leet and zalgo. Deterministic except for the uwu face and zalgo
   marks, which are meant to be random. */
(function () {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const chain = document.getElementById('chain');

  function mapped(map, text) {
    return Array.from(text).map((char) => (map[char] !== undefined ? map[char] : char)).join('');
  }

  function buildRange(start, count, from) {
    const map = {};
    for (let i = 0; i < count; i++) {
      map[String.fromCharCode(from + i)] = String.fromCodePoint(start + i);
    }
    return map;
  }

  const SCRIPT_LOWER = buildRange(0x1d4b6, 26, 97);
  const SCRIPT_UPPER = Object.assign(
    buildRange(0x1d49c, 26, 65),
    { B: '\u212c', E: '\u2130', F: '\u2131', H: '\u210b', I: '\u2110', L: '\u2112', M: '\u2133', R: '\u211b' }
  );

  const BUBBLE_UPPER = buildRange(0x24b6, 26, 65);
  const BUBBLE_LOWER = buildRange(0x24d0, 26, 97);
  const BUBBLE_DIGITS = { 0: '\u24ea', 1: '\u2460', 2: '\u2461', 3: '\u2462', 4: '\u2463', 5: '\u2464', 6: '\u2465', 7: '\u2466', 8: '\u2467', 9: '\u2468' };

  const SMALL_CAPS = {
    a: '\u1d00', b: '\u0299', c: '\u1d04', d: '\u1d05', e: '\u1d07', f: '\ua730', g: '\u0262', h: '\u029c',
    i: '\u026a', j: '\u1d0a', k: '\u1d0b', l: '\u029f', m: '\u1d0d', n: '\u0274', o: '\u1d0f', p: '\u1d18',
    q: '\u01eb', r: '\u0280', s: '\ua731', t: '\u1d1b', u: '\u1d1c', v: '\u1d20', w: '\u1d21', x: 'x',
    y: '\u028f', z: '\u1d22'
  };

  const MORSE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
    J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
    S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
    6: '-....', 7: '--...', 8: '---..', 9: '----.'
  };

  const NATO = {
    a: 'Alfa', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo', f: 'Foxtrot', g: 'Golf',
    h: 'Hotel', i: 'India', j: 'Juliett', k: 'Kilo', l: 'Lima', m: 'Mike', n: 'November',
    o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeo', s: 'Sierra', t: 'Tango', u: 'Uniform',
    v: 'Victor', w: 'Whiskey', x: 'Xray', y: 'Yankee', z: 'Zulu'
  };

  const LEET = { a: '4', b: '8', e: '3', g: '6', i: '1', l: '1', o: '0', s: '5', t: '7', A: '4', B: '8', E: '3', G: '6', I: '1', L: '1', O: '0', S: '5', T: '7' };

  const FLIP = {
    a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01dd', f: '\u025f', g: '\u0183', h: '\u0265', i: '\u1d09',
    j: '\u027e', k: '\u029e', l: 'l', m: '\u026f', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279', s: 's',
    t: '\u0287', u: 'n', v: '\u028c', w: '\u028d', x: 'x', y: '\u028e', z: 'z',
    A: '\u2200', B: '\u0299', C: '\u0186', D: 'D', E: '\u018e', F: '\u2132', G: '\u0183', H: 'H', I: 'I',
    J: '\u017f', K: '\u029e', L: '\u02e5', M: 'W', N: 'N', O: 'O', P: '\u0500', Q: '\u038c', R: '\u1d1a',
    S: 'S', T: '\u2534', U: '\u2229', V: '\u039b', W: 'M', X: 'X', Y: '\u2144', Z: 'Z',
    '.': '\u02d9', ',': "'", '?': '\u00bf', '!': '\u00a1', "'": ',', '"': '\u201e', '(': ')', ')': '(',
    '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '\u214b', '_': '\u203e'
  };

  const COMBINING = [];
  for (let code = 0x0300; code <= 0x036f; code++) COMBINING.push(String.fromCharCode(code));

  function zalgo(text) {
    let out = '';
    for (const char of Array.from(text)) {
      out += char;
      const marks = Math.floor(Math.random() * 3);
      for (let i = 0; i < marks; i++) {
        out += COMBINING[Math.floor(Math.random() * COMBINING.length)];
      }
    }
    return out;
  }

  const FACES = [' (｡◕‿◕｡)', ' owo', ' uwu', ' (>ω<)', ' :3', ' \u2665'];

  const FILTERS = {
    mock: (text) => {
      let upper = false;
      return Array.from(text).map((char) => {
        if (!/[a-z]/i.test(char)) return char;
        upper = !upper;
        return upper ? char.toUpperCase() : char.toLowerCase();
      }).join('');
    },
    uwu: (text) => {
      const body = text
        .replace(/[rl]/g, 'w')
        .replace(/[RL]/g, 'W')
        .replace(/n([aeiou])/g, 'ny$1')
        .replace(/N([aeiou])/g, 'Ny$1')
        .replace(/th/g, 'ff')
        .replace(/Th/g, 'Ff')
        .replace(/ove/g, 'uv')
        .replace(/!+/g, '!');
      return body + FACES[Math.floor(Math.random() * FACES.length)];
    },
    script: (text) => mapped(Object.assign({}, SCRIPT_LOWER, SCRIPT_UPPER), text),
    bubble: (text) => mapped(Object.assign({}, BUBBLE_UPPER, BUBBLE_LOWER, BUBBLE_DIGITS), text),
    smallcaps: (text) => mapped(SMALL_CAPS, text.toLowerCase()),
    fullwidth: (text) => Array.from(text).map((char) => {
      const code = char.charCodeAt(0);
      if (code === 32) return '\u3000';
      if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xfee0);
      return char;
    }).join(''),
    upsidedown: (text) => Array.from(text).reverse().map((char) => (FLIP[char] !== undefined ? FLIP[char] : char)).join(''),
    leet: (text) => mapped(LEET, text),
    reverse: (text) => Array.from(text).reverse().join(''),
    morse: (text) => Array.from(text.toUpperCase()).map((char) => {
      if (char === ' ') return '/';
      return MORSE[char] || '';
    }).filter(Boolean).join(' '),
    nato: (text) => Array.from(text).map((char) => {
      if (/[a-z]/i.test(char)) return NATO[char.toLowerCase()];
      if (char === ' ') return '·';
      return char;
    }).join(' '),
    zalgo: zalgo
  };

  function apply(name) {
    const filter = FILTERS[name];
    if (!filter) return;
    const base = chain.checked && output.textContent ? output.textContent : input.value;
    output.textContent = filter(base);
  }

  document.getElementById('filters').addEventListener('change', (event) => apply(event.target.value));
  document.getElementById('apply-filter').addEventListener('click', () => {
    apply(document.getElementById('filters').value);
  });

  document.getElementById('copy-output').addEventListener('click', () => {
    if (!output.textContent) {
      SS.toast('Nothing to copy yet');
      return;
    }
    SS.copy(output.textContent);
  });

  document.getElementById('use-output').addEventListener('click', () => {
    if (!output.textContent) return;
    input.value = output.textContent;
    SS.toast('Moved into the input');
  });

  document.getElementById('clear').addEventListener('click', () => {
    input.value = '';
    output.textContent = '';
    input.focus();
  });
})();
