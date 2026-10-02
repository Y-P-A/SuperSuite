/* Breakout — paddle, ball, six rows of bricks, three lives, endless levels. */
(function () {
  const W = 800;
  const H = 560;
  const PADDLE_W = 124;
  const PADDLE_H = 16;
  const PADDLE_Y = H - 46;
  const BALL_R = 9;
  const COLS = 10;
  const ROWS = 6;
  const BRICK_GAP = 5;
  const WALL = 40;
  const BRICK_W = (W - WALL * 2 - BRICK_GAP * (COLS - 1)) / COLS;
  const BRICK_H = 24;
  const BRICK_TOP = 60;
  const ROW_COLORS = ['#c0392b', '#e67e22', '#f1c40f', '#27ae60', '#16a085', '#2980b9'];

  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const levelEl = document.getElementById('level');
  const bestEl = document.getElementById('best');
  const pauseBtn = document.getElementById('pause');

  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  let bricks = [];
  let paddle = { x: (W - PADDLE_W) / 2, y: PADDLE_Y, w: PADDLE_W, h: PADDLE_H };
  let ball = { x: W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0, r: BALL_R };
  let score = 0;
  let lives = 3;
  let level = 1;
  let state = 'ready'; // ready | playing | paused | over | levelclear
  let attached = true;
  let clearTimer = 0;

  function speed() {
    return 400 + (level - 1) * 60;
  }

  function buildBricks() {
    bricks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({
          x: WALL + c * (BRICK_W + BRICK_GAP),
          y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
          w: BRICK_W,
          h: BRICK_H,
          color: ROW_COLORS[r % ROW_COLORS.length],
          alive: true
        });
      }
    }
  }

  function resetBall() {
    attached = true;
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - BALL_R - 1;
    ball.vx = 0;
    ball.vy = 0;
  }

  function launch() {
    if (!attached) return;
    attached = false;
    const angle = (-60 + Math.random() * 120) * (Math.PI / 180);
    ball.vx = Math.sin(angle) * speed();
    ball.vy = -Math.abs(Math.cos(angle) * speed());
  }

  function startGame() {
    score = 0;
    lives = 3;
    level = 1;
    paddle.x = (W - PADDLE_W) / 2;
    buildBricks();
    resetBall();
    state = 'playing';
    overlay.hide();
    pauseBtn.textContent = 'Pause';
    refreshHud();
  }

  function refreshHud() {
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
    levelEl.textContent = String(level);
    bestEl.textContent = String(Math.max(SS.best.get('breakout', 0), score));
  }

  function gameOver(won) {
    state = 'over';
    keys.clear();
    const best = SS.best.get('breakout', 0);
    if (score > best) SS.best.set('breakout', score);
    overlay.show(won ? 'You cleared it' : 'Game over',
      'Score ' + score + ' on level ' + level + '. Best: ' + Math.max(best, score) + '.',
      'Play again', startGame);
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pauseBtn.textContent = 'Resume';
      overlay.show('Paused', 'Take your time.', 'Resume', togglePause);
    } else if (state === 'paused') {
      state = 'playing';
      pauseBtn.textContent = 'Pause';
      overlay.hide();
    }
  }

  pauseBtn.addEventListener('click', togglePause);
  document.getElementById('restart').addEventListener('click', startGame);
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    event.stopPropagation();
    if (state === 'ready' || state === 'over') startGame();
    else if (state === 'paused') togglePause();
  });

  function pointerToFieldX(event) {
    const rect = canvas.getBoundingClientRect();
    return (event.clientX - rect.left) * (W / rect.width);
  }

  canvas.addEventListener('pointermove', (event) => {
    paddle.x = Math.max(0, Math.min(W - paddle.w, pointerToFieldX(event) - paddle.w / 2));
  });

  canvas.addEventListener('pointerdown', (event) => {
    paddle.x = Math.max(0, Math.min(W - paddle.w, pointerToFieldX(event) - paddle.w / 2));
    if (state === 'playing' && attached) launch();
  });

  function remainingBricks() {
    return bricks.filter((brick) => brick.alive).length;
  }

  function update(dt) {
    const seconds = dt / 1000;

    if (keys.isDown('ArrowLeft') || keys.isDown('KeyA')) paddle.x -= 560 * seconds;
    if (keys.isDown('ArrowRight') || keys.isDown('KeyD')) paddle.x += 560 * seconds;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

    if (attached) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - BALL_R - 1;
      if (keys.pressed('Space')) launch();
      return;
    }

    ball.x += ball.vx * seconds;
    ball.y += ball.vy * seconds;

    if (ball.x - ball.r < 0 && ball.vx < 0) {
      ball.x = ball.r;
      ball.vx = -ball.vx;
    }
    if (ball.x + ball.r > W && ball.vx > 0) {
      ball.x = W - ball.r;
      ball.vx = -ball.vx;
    }
    if (ball.y - ball.r < 0 && ball.vy < 0) {
      ball.y = ball.r;
      ball.vy = -ball.vy;
    }

    if (ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x - ball.r &&
        ball.x <= paddle.x + paddle.w + ball.r) {
      ball.y = paddle.y - ball.r;
      const relative = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const angle = relative * (Math.PI / 3);
      const magnitude = Math.max(speed(), Math.hypot(ball.vx, ball.vy));
      ball.vx = Math.sin(angle) * magnitude;
      ball.vy = -Math.abs(Math.cos(angle) * magnitude);
    }

    for (const brick of bricks) {
      if (!brick.alive) continue;
      if (ball.x + ball.r < brick.x || ball.x - ball.r > brick.x + brick.w) continue;
      if (ball.y + ball.r < brick.y || ball.y - ball.r > brick.y + brick.h) continue;

      brick.alive = false;
      score += 10 + level;
      const overlapX = Math.min(ball.x + ball.r - brick.x, brick.x + brick.w - (ball.x - ball.r));
      const overlapY = Math.min(ball.y + ball.r - brick.y, brick.y + brick.h - (ball.y - ball.r));
      if (overlapX < overlapY) ball.vx = -ball.vx;
      else ball.vy = -ball.vy;

      const boost = 1.02;
      ball.vx *= boost;
      ball.vy *= boost;
      refreshHud();
      break;
    }

    if (remainingBricks() === 0) {
      state = 'levelclear';
      clearTimer = 1200;
      level++;
      refreshHud();
      return;
    }

    if (ball.y - ball.r > H) {
      lives--;
      refreshHud();
      if (lives <= 0) {
        gameOver(false);
      } else {
        paddle.x = (W - PADDLE_W) / 2;
        resetBall();
      }
    }
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    for (const brick of bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(brick.x, brick.y, brick.w, 4);
    }

    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, 4);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    if (state === 'levelclear') {
      ctx.fillStyle = 'rgba(15,22,38,0.78)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LEVEL ' + level, W / 2, H / 2);
      ctx.font = 'bold 18px ui-monospace, monospace';
      ctx.fillStyle = '#cfd8e3';
      ctx.fillText('Bricks are back — and faster', W / 2, H / 2 + 34);
    }

    if (attached && state === 'playing') {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 16px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SPACE OR CLICK TO LAUNCH', W / 2, H - 70);
    }
  }

  const loop = SS.createLoop((dt) => {
    /* Pause and restart are read from any state, so P can also un-pause. */
    if (keys.pressed('KeyP') && (state === 'playing' || state === 'paused')) {
      keys.endFrame();
      togglePause();
      refreshHud();
      draw();
      return;
    }
    if (keys.pressed('KeyR')) {
      keys.endFrame();
      startGame();
      refreshHud();
      draw();
      return;
    }

    if (state === 'levelclear') {
      clearTimer -= dt;
      if (clearTimer <= 0) {
        buildBricks();
        resetBall();
        state = 'playing';
      }
    } else if (state === 'playing') {
      update(dt);
    }
    keys.endFrame();
    refreshHud();
    draw();
  });

  buildBricks();
  refreshHud();
  draw();
  loop.start();
})();
