/* Whack-a-Mole — sixty seconds, nine holes, one increasingly busy mole. */
(function () {
  const HOLES = 9;
  const DURATION = 60;

  const board = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const missesEl = document.getElementById('misses');
  const bestEl = document.getElementById('best');
  const status = document.getElementById('status');

  let score = 0;
  let misses = 0;
  let left = DURATION;
  let running = false;
  let timer = 0;
  let popTimer = 0;
  let active = -1;
  let upSince = 0;

  board.innerHTML = new Array(HOLES).fill(0).map(function (_, i) {
    return '<button class="mole__hole" type="button" data-hole="' + i + '" aria-label="Hole"><span class="mole__body">' +
      '<span class="mole__face">●</span></span></button>';
  }).join('');

  function paintBest() {
    bestEl.textContent = String(SS.best.get('whack', 0));
  }

  function pop() {
    if (!running) return;
    const holes = board.querySelectorAll('.mole__hole');
    if (active > -1) {
      holes[active].classList.remove('is-up');
      if (Date.now() - upSince < 900) misses++;
      missesEl.textContent = String(misses);
    }
    active = Math.floor(Math.random() * HOLES);
    upSince = Date.now();
    holes[active].classList.add('is-up');
    const difficulty = 950 - Math.min(520, score * 12);
    popTimer = setTimeout(pop, Math.max(430, difficulty));
  }

  function bop(index) {
    if (!running || index !== active) {
      if (running && index !== active) { misses++; missesEl.textContent = String(misses); }
      return;
    }
    score++;
    scoreEl.textContent = String(score);
    board.querySelector('[data-hole="' + index + '"]').classList.remove('is-up');
    active = -1;
    status.textContent = 'Nice — ' + score + ' bopped.';
  }

  function end() {
    running = false;
    clearInterval(timer);
    clearTimeout(popTimer);
    board.querySelectorAll('.mole__hole').forEach(function (hole) { hole.classList.remove('is-up'); });
    const best = SS.best.get('whack', 0);
    if (score > best) SS.best.set('whack', score);
    paintBest();
    status.textContent = 'Time! You bopped ' + score + ' moles with ' + misses + ' misses.';
    SS.toast('Final score ' + score);
  }

  function start() {
    score = 0;
    misses = 0;
    left = DURATION;
    active = -1;
    running = true;
    scoreEl.textContent = '0';
    missesEl.textContent = '0';
    timeEl.textContent = String(DURATION);
    status.textContent = 'Go! Bop every mole.';
    clearInterval(timer);
    clearTimeout(popTimer);
    timer = setInterval(function () {
      left--;
      timeEl.textContent = String(Math.max(0, left));
      if (left <= 0) end();
    }, 1000);
    pop();
  }

  board.addEventListener('pointerdown', function (event) {
    const hole = event.target.closest('[data-hole]');
    if (hole) { event.preventDefault(); bop(Number(hole.getAttribute('data-hole'))); }
  });

  document.getElementById('start').addEventListener('click', start);
  paintBest();
})();
