/* Stopwatch — elapsed time from a start stamp, so it never drifts. */
(function () {
  const display = document.getElementById('display');
  const hint = document.getElementById('hint');
  const laps = document.getElementById('laps');
  const summary = document.getElementById('lap-summary');
  const startBtn = document.getElementById('start');
  const lapBtn = document.getElementById('lap');

  let startedAt = 0;
  let elapsed = 0;
  let running = false;
  let ticker = 0;
  let lapList = [];
  let lastLap = 0;

  function format(ms) {
    const total = Math.max(0, ms);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const hundredths = Math.floor((total % 1000) / 10);
    const pad = function (n, size) { return String(n).padStart(size || 2, '0'); };
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return pad(hours) + ':' + pad(minutes % 60) + ':' + pad(seconds) + '.' + pad(hundredths);
    }
    return pad(minutes) + ':' + pad(seconds) + '.' + pad(hundredths);
  }

  function current() { return elapsed + (running ? performance.now() - startedAt : 0); }

  function paint() { display.textContent = format(current()); }

  function renderLaps() {
    if (!lapList.length) {
      laps.innerHTML = '<li class="muted">Laps you record will show up here.</li>';
      summary.textContent = 'No laps yet';
      return;
    }
    summary.textContent = lapList.length + (lapList.length === 1 ? ' lap' : ' laps');
    laps.innerHTML = lapList.slice().reverse().map(function (lap, index) {
      const number = lapList.length - index;
      return '<li><strong>Lap ' + number + '</strong> &nbsp; ' + format(lap.split) +
        ' &nbsp; <span class="muted">total ' + format(lap.total) + '</span></li>';
    }).join('');
  }

  function start() {
    running = true;
    startedAt = performance.now();
    startBtn.textContent = 'Stop';
    lapBtn.disabled = false;
    hint.textContent = 'Running';
    clearInterval(ticker);
    ticker = setInterval(paint, 33);
    paint();
  }

  function stop() {
    elapsed = current();
    running = false;
    clearInterval(ticker);
    startBtn.textContent = 'Start';
    lapBtn.disabled = true;
    hint.textContent = 'Stopped at ' + format(elapsed);
    paint();
  }

  function reset() {
    running = false;
    elapsed = 0;
    lapList = [];
    lastLap = 0;
    clearInterval(ticker);
    startBtn.textContent = 'Start';
    lapBtn.disabled = true;
    hint.textContent = '\u00a0';
    renderLaps();
    paint();
  }

  function lap() {
    const total = current();
    lapList.push({ split: total - lastLap, total: total });
    lastLap = total;
    renderLaps();
  }

  function toggle() { running ? stop() : start(); }

  startBtn.addEventListener('click', toggle);
  lapBtn.addEventListener('click', lap);
  document.getElementById('reset').addEventListener('click', reset);

  document.addEventListener('keydown', function (event) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.code === 'Space') { event.preventDefault(); toggle(); }
    else if (event.code === 'KeyL' && running) { event.preventDefault(); lap(); }
    else if (event.code === 'KeyR') { event.preventDefault(); reset(); }
  });

  paint();
})();
