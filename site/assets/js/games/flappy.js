/* Flappy — gravity, pipes and a bird. Space, click or tap to flap. */
(function () {
  const W = 380;
  const H = 520;
  const GRAVITY = 1600;
  const FLAP = -460;
  const PIPE_W = 64;
  const SPEED = 165;
  const R = 13;

  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const pauseBtn = document.getElementById('pause');

  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  let bird = { y: H / 2, vy: 0 };
  let pipes = [];
  let score = 0;
  let spawnAt = 0;
  let state = 'ready';

  function gapSize() { return Math.max(112, 168 - score * 4); }

  function reset() {
    bird = { y: H / 2, vy: 0 };
    pipes = [];
    score = 0;
    spawnAt = 0;
    state = 'ready';
    hud();
  }

  function hud() {
    scoreEl.textContent = String(score);
    bestEl.textContent = String(Math.max(SS.best.get('flappy', 0), score));
  }

  function start() {
    reset();
    state = 'playing';
    pauseBtn.textContent = 'Pause';
    overlay.hide();
  }

  function flap() {
    if (state === 'playing') bird.vy = FLAP;
  }

  function finish() {
    state = 'over';
    const best = SS.best.get('flappy', 0);
    if (score > best) SS.best.set('flappy', score);
    hud();
    overlay.show('Game over',
      'You cleared ' + score + (score === 1 ? ' pipe' : ' pipes') + '. Best: ' + Math.max(best, score) + '.',
      'Try again', start);
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pauseBtn.textContent = 'Resume';
      overlay.show('Paused', 'Take a breath.', 'Resume', togglePause);
    } else if (state === 'paused') {
      state = 'playing';
      pauseBtn.textContent = 'Pause';
      overlay.hide();
    }
  }

  function spawn() {
    const gap = gapSize();
    const top = 40 + Math.random() * (H - gap - 140);
    pipes.push({ x: W + 20, top: top, gap: gap, scored: false });
  }

  function update(dt) {
    const seconds = dt / 1000;
    bird.vy += GRAVITY * seconds;
    bird.y += bird.vy * seconds;

    if (bird.y < R) { bird.y = R; bird.vy = 0; }
    if (bird.y > H - 40 - R) { finish(); return; }

    spawnAt -= dt;
    if (spawnAt <= 0) { spawn(); spawnAt = 1450; }

    pipes.forEach(function (pipe) { pipe.x -= SPEED * seconds; });
    pipes = pipes.filter(function (pipe) { return pipe.x + PIPE_W > -10; });

    const bx = birdX();
    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];
      const overlapsX = bx + R > pipe.x && bx - R < pipe.x + PIPE_W;
      const insideGap = bird.y - R > pipe.top && bird.y + R < pipe.top + pipe.gap;
      if (overlapsX && !insideGap) { finish(); return; }
      if (!pipe.scored && pipe.x + PIPE_W < bx - R) {
        pipe.scored = true;
        score++;
        hud();
      }
    }
  }

  function birdX() { return 96; }

  function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#2b6cb0');
    sky.addColorStop(1, '#8fd3f4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#27ae60';
    pipes.forEach(function (pipe) {
      ctx.fillRect(pipe.x, 0, PIPE_W, pipe.top);
      ctx.fillRect(pipe.x, pipe.top + pipe.gap, PIPE_W, H - pipe.top - pipe.gap);
      ctx.fillStyle = '#1e8449';
      ctx.fillRect(pipe.x - 4, pipe.top - 16, PIPE_W + 8, 16);
      ctx.fillRect(pipe.x - 4, pipe.top + pipe.gap, PIPE_W + 8, 16);
      ctx.fillStyle = '#27ae60';
    });

    ctx.fillStyle = '#c8a165';
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = '#a5814a';
    ctx.fillRect(0, H - 40, W, 6);

    ctx.save();
    ctx.translate(birdX(), bird.y);
    ctx.rotate(Math.max(-0.5, Math.min(1.1, bird.vy / 700)));
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(R - 2, 0);
    ctx.lineTo(R + 8, 3);
    ctx.lineTo(R - 2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(4, -4, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  canvas.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    if (state === 'ready' || state === 'over') start();
    else flap();
  });

  pauseBtn.addEventListener('click', togglePause);
  document.getElementById('restart').addEventListener('click', start);
  document.querySelector('[data-overlay-button]').addEventListener('click', function (event) {
    event.stopPropagation();
    if (state === 'paused') togglePause();
    else start();
  });

  const loop = SS.createLoop(function (dt) {
    /* Pause and restart are read in every state so P can also un-pause. */
    if (keys.pressed('KeyP') && (state === 'playing' || state === 'paused')) {
      keys.endFrame(); togglePause(); draw(); return;
    }
    if (keys.pressed('KeyR')) { keys.endFrame(); start(); draw(); return; }

    if (state === 'ready' && keys.pressed('Space')) { keys.endFrame(); start(); }
    if (state === 'playing') {
      if (keys.pressed('Space') || keys.pressed('ArrowUp') || keys.pressed('KeyW')) flap();
      update(dt);
    }
    keys.endFrame();
    draw();
  });

  hud();
  draw();
  loop.start();
})();
