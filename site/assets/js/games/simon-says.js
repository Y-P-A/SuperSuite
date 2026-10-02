/* Simon Says — a growing colour sequence, played back with tones. */
(function () {
  const PADS = [
    { key: '1', color: '#27ae60', tone: 329.6 },
    { key: '2', color: '#c0392b', tone: 440.0 },
    { key: '3', color: '#f1c40f', tone: 554.4 },
    { key: '4', color: '#2980b9', tone: 659.3 }
  ];

  const board = document.getElementById('board');
  const status = document.getElementById('status');
  const roundEl = document.getElementById('round');
  const bestEl = document.getElementById('best');
  const speedEl = document.getElementById('speed');

  let sequence = [];
  let input = [];
  let playing = false;   // true while the sequence is being shown
  let accepting = false; // true while the player may tap
  let round = 0;

  board.innerHTML = PADS.map(function (pad, i) {
    return '<button class="simon__pad" type="button" data-pad="' + i + '" style="background:' + pad.color + '"></button>';
  }).join('');

  function audio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    return Ctx ? new Ctx() : null;
  }
  const ctx = audio();

  function tone(frequency, duration) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  function flash(index, duration) {
    const button = board.querySelector('[data-pad="' + index + '"]');
    button.classList.add('is-on');
    tone(PADS[index].tone, duration / 1000);
    setTimeout(function () { button.classList.remove('is-on'); }, duration);
  }

  function speedFactor() { return Math.max(0.55, 1 - round * 0.045); }

  function show() {
    playing = true;
    accepting = false;
    status.textContent = 'Watch closely…';
    const gap = 620 * speedFactor();
    sequence.forEach(function (index, position) {
      setTimeout(function () { flash(index, Math.max(180, 360 * speedFactor())); }, position * gap + 320);
    });
    setTimeout(function () {
      playing = false;
      accepting = true;
      status.textContent = 'Your turn — repeat all ' + sequence.length + ' steps.';
    }, sequence.length * gap + 420);
  }

  function next() {
    sequence.push(Math.floor(Math.random() * PADS.length));
    input = [];
    round++;
    roundEl.textContent = String(round);
    speedEl.textContent = (1 / speedFactor()).toFixed(1).replace('.0', '') + '×';
    show();
  }

  function press(index) {
    if (!accepting) return;
    flash(index, 220);
    input.push(index);
    const position = input.length - 1;
    if (input[position] !== sequence[position]) { fail(); return; }
    if (input.length === sequence.length) {
      accepting = false;
      const best = SS.best.get('simon', 0);
      if (round > best) SS.best.set('simon', round);
      bestEl.textContent = String(Math.max(best, round));
      status.textContent = 'Correct — next round incoming…';
      setTimeout(next, 800);
    }
  }

  function fail() {
    accepting = false;
    playing = false;
    status.textContent = 'Wrong pad — you made it to round ' + round + '. Press Start to play again.';
    const best = SS.best.get('simon', 0);
    bestEl.textContent = String(Math.max(best, round));
    SS.toast('You reached round ' + round);
  }

  function start() {
    sequence = [];
    input = [];
    round = 0;
    roundEl.textContent = '0';
    speedEl.textContent = '1×';
    if (ctx && ctx.state === 'suspended') ctx.resume();
    next();
  }

  board.addEventListener('click', function (event) {
    const button = event.target.closest('[data-pad]');
    if (button) press(Number(button.getAttribute('data-pad')));
  });

  document.getElementById('start').addEventListener('click', start);
  document.getElementById('replay').addEventListener('click', function () {
    if (sequence.length && !playing) show();
  });

  document.addEventListener('keydown', function (event) {
    if (event.target.tagName === 'INPUT') return;
    const pad = PADS.findIndex(function (p) { return p.key === event.key; });
    if (pad > -1) { event.preventDefault(); press(pad); }
  });

  bestEl.textContent = String(SS.best.get('simon', 0));
})();
