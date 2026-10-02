/* Morse Code — bidirectional translation plus a Web Audio beeper. */
(function () {
  const text = document.getElementById('text');
  const code = document.getElementById('code');

  const MAP = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '-': '-....-',
    '(': '-.--.', ')': '-.--.-', '@': '.--.-.', ':': '---...', "'": '.----.', '"': '.-..-.'
  };
  const REVERSE = {};
  Object.keys(MAP).forEach(function (key) { REVERSE[MAP[key]] = key; });

  function toMorse(value) {
    return value.toUpperCase().split('').map(function (char) {
      if (char === ' ') return '/';
      return MAP[char] || '';
    }).filter(function (part) { return part; }).join(' ');
  }

  function toText(value) {
    return value.trim().split(/\s+/).map(function (token) {
      if (token === '/') return ' ';
      return REVERSE[token] || '?';
    }).join('');
  }

  document.getElementById('text-to-code').addEventListener('click', function () {
    code.value = toMorse(text.value);
  });
  document.getElementById('code-to-text').addEventListener('click', function () {
    text.value = toText(code.value);
  });
  document.getElementById('copy').addEventListener('click', function () {
    if (code.value) SS.copy(code.value);
  });

  /* One shared context, resumed on every press. Building a fresh AudioContext
     per tap hits the browser's context limit after a few beeps and everything
     after that is silent, so the context is created once and kept. */
  let ctx = null;
  let master = null;

  function ensureAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) {
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(start, duration) {
    const osc = ctx.createOscillator();
    const shape = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, start);
    shape.gain.setValueAtTime(0.0001, start);
    shape.gain.exponentialRampToValueAtTime(0.45, start + 0.008);
    shape.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(shape);
    shape.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  document.getElementById('beep').addEventListener('click', function () {
    if (!code.value.trim()) code.value = toMorse(text.value);
    if (!/[.-]/.test(code.value)) { SS.toast('Nothing to beep'); return; }
    if (!ensureAudio()) { SS.toast('No audio support here'); return; }
    const unit = 0.08; // 15 wpm
    let at = ctx.currentTime + 0.08;

    code.value.split('').forEach(function (char) {
      if (char === '.') {
        tone(at, unit); at += unit * 2;
      } else if (char === '-') {
        tone(at, unit * 3); at += unit * 4;
      } else if (char === ' ') {
        at += unit * 2;
      } else if (char === '/') {
        at += unit * 4;
      }
    });
  });

  code.value = toMorse(text.value);
  text.addEventListener('input', function () { code.value = toMorse(text.value); });
  code.addEventListener('input', function () { text.value = toText(code.value); });
})();
