/* Pong — you on the left, the CPU on the right, first to seven. */
(function () {
  const W = 800;
  const H = 480;
  const PADDLE_W = 16;
  const PADDLE_H = 92;
  const MARGIN = 26;
  const WIN_SCORE = 7;
  const BASE_SPEED = 380;

  const canvas = document.getElementById('court');
  const ctx = canvas.getContext('2d');
  const youEl = document.getElementById('score-you');
  const cpuEl = document.getElementById('score-cpu');
  const rallyEl = document.getElementById('rally');
  const bestEl = document.getElementById('best');
  const pauseBtn = document.getElementById('pause');

  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  let player = { x: MARGIN, y: H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H };
  let cpu = { x: W - MARGIN - PADDLE_W, y: H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H };
  let ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 10 };
  let scoreYou = 0;
  let scoreCpu = 0;
  let rally = 0;
  let serveTimer = 900;
  let state = 'ready';
  let difficulty = 0.9;
  let pointerY = null;

  function clampPaddle(paddle) {
    paddle.y = Math.max(0, Math.min(H - paddle.h, paddle.y));
  }

  function serve(direction) {
    ball.x = W / 2;
    ball.y = H / 2;
    ball.vx = BASE_SPEED * direction;
    ball.vy = (Math.random() * 200 - 100);
    rally = 0;
    serveTimer = 900;
  }

  function resetMatch() {
    scoreYou = 0;
    scoreCpu = 0;
    rally = 0;
    player.y = H / 2 - PADDLE_H / 2;
    cpu.y = H / 2 - PADDLE_H / 2;
    serve(Math.random() < 0.5 ? -1 : 1);
    state = 'playing';
    overlap();
    refreshHud();
  }

  function refreshHud() {
    youEl.textContent = String(scoreYou);
    cpuEl.textContent = String(scoreCpu);
    rallyEl.textContent = String(rally);
    bestEl.textContent = String(Math.max(SS.best.get('pong-rally', 0), rally));
  }

  function overlap() {
    overlay.hide();
    pauseBtn.textContent = 'Pause';
  }

  function finish() {
    state = 'over';
    keys.clear();
    const best = SS.best.get('pong-rally', 0);
    if (rally > best) SS.best.set('pong-rally', rally);
    const won = scoreYou > scoreCpu;
    overlay.show(won ? 'You win' : 'CPU wins',
      scoreYou + ' \u2013 ' + scoreCpu + '. Longest rally: ' + Math.max(best, rally) + ' hits.',
      'Rematch', resetMatch);
    refreshHud();
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pauseBtn.textContent = 'Resume';
      overlay.show('Paused', 'Take your time.', 'Resume', togglePause);
    } else if (state === 'paused') {
      state = 'playing';
      overlap();
    }
  }

  pauseBtn.addEventListener('click', togglePause);
  document.getElementById('restart').addEventListener('click', resetMatch);
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    event.stopPropagation();
    if (state === 'ready' || state === 'over') resetMatch();
    else if (state === 'paused') togglePause();
  });

  document.querySelectorAll('[data-difficulty]').forEach((chip) => {
    chip.addEventListener('click', () => {
      difficulty = parseFloat(chip.getAttribute('data-difficulty'));
      document.querySelectorAll('[data-difficulty]').forEach((other) => {
        other.classList.toggle('is-active', other === chip);
      });
      if (state === 'playing' || state === 'paused') resetMatch();
    });
  });

  function pointerToCourt(event) {
    const rect = canvas.getBoundingClientRect();
    return (event.clientY - rect.top) * (H / rect.height);
  }

  canvas.addEventListener('pointermove', (event) => {
    pointerY = pointerToCourt(event);
    if (state === 'playing') {
      player.y = pointerY - player.h / 2;
      clampPaddle(player);
    }
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (state === 'playing') {
      player.y = pointerToCourt(event) - player.h / 2;
      clampPaddle(player);
    }
  });

  canvas.addEventListener('pointerleave', () => {
    pointerY = null;
  });

  function update(dt) {
    const seconds = dt / 1000;

    if (keys.isDown('ArrowUp') || keys.isDown('KeyW')) player.y -= 540 * seconds;
    if (keys.isDown('ArrowDown') || keys.isDown('KeyS')) player.y += 540 * seconds;
    clampPaddle(player);

    /* CPU: track the ball while it comes its way, drift home otherwise. */
    const cpuSpeed = 400 * difficulty;
    const target = ball.vx > 0 ? ball.y - cpu.h / 2 : H / 2 - cpu.h / 2;
    const diff = target - cpu.y;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), cpuSpeed * seconds);
    cpu.y += step;
    clampPaddle(cpu);

    if (serveTimer > 0) {
      serveTimer -= dt;
      return;
    }

    ball.x += ball.vx * seconds;
    ball.y += ball.vy * seconds;

    if (ball.y - ball.r < 0 && ball.vy < 0) {
      ball.y = ball.r;
      ball.vy = -ball.vy;
    }
    if (ball.y + ball.r > H && ball.vy > 0) {
      ball.y = H - ball.r;
      ball.vy = -ball.vy;
    }

    function bounce(paddle, direction) {
      ball.vx = -ball.vx * 1.045;
      ball.vx = Math.max(-980, Math.min(980, ball.vx));
      const relative = (ball.y - (paddle.y + paddle.h / 2)) / (paddle.h / 2);
      ball.vy = Math.max(-420, Math.min(420, ball.vy + relative * 190));
      ball.x = direction > 0 ? paddle.x + paddle.w + ball.r : paddle.x - ball.r;
      rally++;
      refreshHud();
    }

    if (ball.vx < 0 &&
        ball.x - ball.r <= player.x + player.w &&
        ball.x - ball.r >= player.x &&
        ball.y >= player.y - ball.r && ball.y <= player.y + player.h + ball.r) {
      bounce(player, 1);
    }

    if (ball.vx > 0 &&
        ball.x + ball.r >= cpu.x &&
        ball.x + ball.r <= cpu.x + cpu.w + ball.r &&
        ball.y >= cpu.y - ball.r && ball.y <= cpu.y + cpu.h + ball.r) {
      bounce(cpu, -1);
    }

    if (ball.x < -ball.r * 4) {
      scoreCpu++;
      refreshHud();
      if (scoreCpu >= WIN_SCORE) finish(); else serve(1);
    } else if (ball.x > W + ball.r * 4) {
      scoreYou++;
      refreshHud();
      if (scoreYou >= WIN_SCORE) finish(); else serve(-1);
    }
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 18]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(cpu.x, cpu.y, cpu.w, cpu.h);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 56px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillText(String(scoreYou), W / 2 - 90, 70);
    ctx.fillText(String(scoreCpu), W / 2 + 90, 70);

    if (serveTimer > 0 && state === 'playing') {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 22px ui-monospace, monospace';
      ctx.fillText('READY', W / 2, H - 40);
    }
  }

  const loop = SS.createLoop((dt) => {
    /* Pause and restart are read from any state, so P can also un-pause. */
    if (keys.pressed('KeyP') && (state === 'playing' || state === 'paused')) {
      keys.endFrame();
      togglePause();
      draw();
      return;
    }
    if (keys.pressed('KeyR')) {
      keys.endFrame();
      resetMatch();
      draw();
      return;
    }

    if (state === 'playing') update(dt);
    keys.endFrame();
    draw();
  });

  refreshHud();
  draw();
  loop.start();
})();
