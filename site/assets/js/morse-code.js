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

  document.getElementById('beep').addEventListener('click', function () {
    if (!code.value.trim()) code.value = toMorse(text.value);
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) { SS.toast('No audio support here'); return; }
    const ctx = new AudioCtx();
    const unit = 0.08; // 15 wpm
    let at = ctx.currentTime + 0.05;

    code.value.split('').forEach(function (char) {
      if (char === '.') {
        tone(ctx, at, unit); at += unit * 2;
      } else if (char === '-') {
        tone(ctx, at, unit * 3); at += unit * 4;
      } else if (char === ' ') {
        at += unit * 2;
      } else if (char === '/') {
        at += unit * 4;
      }
    });

    setTimeout(function () { ctx.close(); }, (at - ctx.currentTime + 0.4) * 1000);
  });

  function tone(ctx, start, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 640;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.008);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  code.value = toMorse(text.value);
  text.addEventListener('input', function () { code.value = toMorse(text.value); });
  code.addEventListener('input', function () { text.value = toText(code.value); });
})();
