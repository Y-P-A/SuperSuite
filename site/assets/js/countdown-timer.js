/* Countdown Timer — deadline based, so the display stays right even after the
   tab is backgrounded. */
(function () {
  const display = document.getElementById('display');
  const hint = document.getElementById('hint');
  const progress = document.getElementById('progress');
  const minutes = document.getElementById('minutes');
  const seconds = document.getElementById('seconds');
  const startBtn = document.getElementById('start');

  let total = 300000;
  let endsAt = 0;
  let remaining = total;
  let running = false;
  let ticker = 0;

  function format(ms) {
    const value = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(value / 60);
    const s = value % 60;
    if (m >= 60) return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function paint() {
    const left = running ? Math.max(0, endsAt - performance.now()) : remaining;
    display.textContent = format(left);
    progress.style.width = (total ? Math.min(100, ((total - left) / total) * 100) : 0) + '%';
    if (running && left <= 0) finish();
  }

  function chime() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [0, 0.35, 0.7].forEach(function (offset) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.26);
    });
    setTimeout(function () { ctx.close(); }, 1400);
  }

  function finish() {
    running = false;
    clearInterval(ticker);
    remaining = 0;
    display.textContent = '00:00';
    hint.textContent = 'Time is up';
    startBtn.textContent = 'Start';
    progress.style.width = '100%';
    chime();
    SS.toast('Timer finished');
  }

  function readInputs() {
    const m = Math.max(0, Number(minutes.value) || 0);
    const s = Math.max(0, Math.min(59, Number(seconds.value) || 0));
    total = (m * 60 + s) * 1000;
    const presets = document.getElementById('presets');
    presets.value = Array.from(presets.options).some((option) => option.value === String(total / 1000))
      ? String(total / 1000) : '';
    return total;
  }

  function start() {
    if (running) {
      remaining = Math.max(0, endsAt - performance.now());
      running = false;
      clearInterval(ticker);
      startBtn.textContent = 'Start';
      hint.textContent = 'Paused at ' + format(remaining);
      return;
    }
    if (remaining <= 0) remaining = readInputs();
    if (remaining <= 0) { SS.toast('Set a time first'); return; }
    running = true;
    endsAt = performance.now() + remaining;
    startBtn.textContent = 'Pause';
    hint.textContent = 'Counting down…';
    clearInterval(ticker);
    ticker = setInterval(paint, 100);
    paint();
  }

  function reset() {
    running = false;
    clearInterval(ticker);
    remaining = readInputs();
    display.textContent = format(remaining);
    hint.textContent = '\u00a0';
    startBtn.textContent = 'Start';
    progress.style.width = '0%';
  }

  startBtn.addEventListener('click', start);
  document.getElementById('reset').addEventListener('click', reset);
  [minutes, seconds].forEach(function (el) {
    el.addEventListener('input', function () { if (!running) reset(); });
  });
  document.getElementById('presets').addEventListener('change', function (event) {
    if (!event.target.value) return;
    const value = Number(event.target.value);
    minutes.value = String(Math.floor(value / 60));
    seconds.value = String(value % 60);
    reset();
  });

  reset();
})();
