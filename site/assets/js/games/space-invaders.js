/* Space Invaders — the fleet marches side to side and drops lower every lap.
   Clear it before it reaches the ground; each wave starts faster. */
(function () {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const scoreEl = document.getElementById('score');
  const waveEl = document.getElementById('wave');
  const livesEl = document.getElementById('lives');
  const bestEl = document.getElementById('best');
  const pauseBtn = document.getElementById('pause');

  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  const COLS = 8;
  const ROWS = 4;
  const AW = 30;
  const AH = 18;
  const GAPX = 10;
  const GAPY = 12;
  const FLEET_W = COLS * AW + (COLS - 1) * GAPX;
  const BASE_X = (W - FLEET_W) / 2;
  const ROW_COLORS = ['#ff6bcb', '#f5c451', '#43d17a', '#3fc9f5'];

  const PLAYER_W = 40;
  const PLAYER_H = 16;
  const PLAYER_Y = H - 34;
  const PLAYER_SPEED = 270;

  let state = 'ready'; // ready | playing | paused | over
  let player;
  let bullets;
  let bombs;
  let fleet;
  let offsetX;
  let offsetY;
  let dir;
  let stepTimer;
  let stepDelay;
  let bunkers;
  let score;
  let lives;
  let wave;
  let cooldown;

  const alive = () => fleet.filter((alien) => alien.alive).length;

  function alienRect(alien) {
    return {
      x: BASE_X + alien.c * (AW + GAPX) + offsetX,
      y: 46 + alien.r * (AH + GAPY) + offsetY,
      w: AW,
      h: AH
    };
  }

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function best() {
    return Math.max(SS.best.get('space-invaders', 0), score);
  }

  function refreshHud() {
    scoreEl.textContent = String(score);
    waveEl.textContent = String(wave);
    livesEl.textContent = String(lives);
    bestEl.textContent = String(best());
  }

  function resetFleet() {
    fleet = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) fleet.push({ r: r, c: c, alive: true });
    }
    offsetX = 0;
    offsetY = 0;
    dir = 1;
    stepTimer = 0;
    stepDelay = pace();
  }

  /* Faster as the fleet thins out and as the waves stack up. */
  function pace() {
    const cleared = ROWS * COLS - alive();
    return Math.max(70, 600 - cleared * 17 - (wave - 1) * 55);
  }

  function makeBunkers() {
    bunkers = [];
    const block = 6;
    for (let b = 0; b < 3; b++) {
      const originX = (W / 4) * (b + 1) - 24;
      const originY = PLAYER_Y - 66;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
          if (row === 3 && col > 1 && col < 6) continue; /* the archway */
          bunkers.push({ x: originX + col * block, y: originY + row * block, w: block, h: block, hp: 3 });
        }
      }
    }
  }

  function startGame() {
    score = 0;
    lives = 3;
    wave = 1;
    player = { x: W / 2 - PLAYER_W / 2 };
    bullets = [];
    bombs = [];
    cooldown = 0;
    resetFleet();
    makeBunkers();
    state = 'playing';
    pauseBtn.textContent = 'Pause';
    overlay.hide();
    refreshHud();
  }

  function finish(headline, body) {
    state = 'over';
    keys.clear();
    if (score > SS.best.get('space-invaders', 0)) SS.best.set('space-invaders', score);
    refreshHud();
    overlay.show(headline, body, 'Play again', startGame);
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      pauseBtn.textContent = 'Resume';
      overlay.show('Paused', 'The fleet is holding position.', 'Resume', togglePause);
    } else if (state === 'paused') {
      state = 'playing';
      pauseBtn.textContent = 'Pause';
      overlay.hide();
    }
  }

  function damage(rect) {
    for (let i = 0; i < bunkers.length; i++) {
      const block = bunkers[i];
      if (overlap(rect, block)) {
        block.hp -= 1;
        if (block.hp <= 0) bunkers.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  function step(dt) {
    if (state !== 'playing') return;
    const seconds = dt / 1000;

    if (keys.isDown('ArrowLeft') || keys.isDown('KeyA')) player.x -= PLAYER_SPEED * seconds;
    if (keys.isDown('ArrowRight') || keys.isDown('KeyD')) player.x += PLAYER_SPEED * seconds;
    player.x = Math.max(6, Math.min(W - PLAYER_W - 6, player.x));

    cooldown = Math.max(0, cooldown - dt);
    if (keys.pressed('Space') && cooldown === 0 && bullets.length === 0) {
      bullets.push({ x: player.x + PLAYER_W / 2 - 2, y: PLAYER_Y - 12, w: 4, h: 14 });
      cooldown = 160;
    }

    /* fleet march */
    stepTimer += dt;
    if (stepTimer >= stepDelay) {
      stepTimer = 0;
      const left = BASE_X + offsetX;
      const right = left + FLEET_W;
      if (dir > 0 && right + 10 > W - 8) {
        dir = -1;
        offsetY += 14;
      } else if (dir < 0 && left - 10 < 8) {
        dir = 1;
        offsetY += 14;
      } else {
        offsetX += dir * 10;
      }
      stepDelay = pace();
    }

    /* bullets */
    bullets.forEach((bullet) => { bullet.y -= 560 * seconds; });
    bullets = bullets.filter((bullet) => bullet.y + bullet.h > 0);

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (damage(bullet)) { bullets.splice(i, 1); continue; }
      const hit = fleet.find((alien) => alien.alive && overlap(bullet, alienRect(alien)));
      if (hit) {
        hit.alive = false;
        bullets.splice(i, 1);
        score += 10 * (ROWS - hit.r);
        refreshHud();
      }
    }

    /* bombs */
    const living = fleet.filter((alien) => alien.alive);
    if (living.length) {
      const chance = (0.00022 + wave * 0.00006) * (ROWS * COLS / Math.max(living.length, 1)) * dt;
      if (Math.random() < chance) {
        const lowest = {};
        living.forEach((alien) => {
          if (!lowest[alien.c] || alien.r > lowest[alien.c].r) lowest[alien.c] = alien;
        });
        const shooters = Object.keys(lowest).map((key) => lowest[key]);
        const shooter = shooters[Math.floor(Math.random() * shooters.length)];
        const rect = alienRect(shooter);
        bombs.push({ x: rect.x + rect.w / 2 - 2, y: rect.y + rect.h, w: 4, h: 12 });
      }
    }

    bombs.forEach((bomb) => { bomb.y += (210 + wave * 18) * seconds; });
    for (let i = bombs.length - 1; i >= 0; i--) {
      const bomb = bombs[i];
      if (bomb.y > H) { bombs.splice(i, 1); continue; }
      if (damage(bomb)) { bombs.splice(i, 1); continue; }
      if (overlap(bomb, { x: player.x, y: PLAYER_Y, w: PLAYER_W, h: PLAYER_H })) {
        bombs.splice(i, 1);
        lives -= 1;
        refreshHud();
        if (lives <= 0) { finish('Overrun', 'You scored ' + score + ' and reached wave ' + wave + '.', startGame); return; }
      }
    }

    if (!fleet.some((alien) => alien.alive)) {
      wave += 1;
      bullets = [];
      bombs = [];
      resetFleet();
      makeBunkers();
      refreshHud();
      SS.toast('Wave ' + wave);
    }

    if (fleet.some((alien) => alien.alive && alienRect(alien).y + AH >= PLAYER_Y)) {
      finish('They landed', 'You scored ' + score + ' and reached wave ' + wave + '.', startGame);
    }
  }

  function drawAlien(rect, color) {
    ctx.fillStyle = color;
    ctx.fillRect(rect.x + 7, rect.y, rect.w - 14, 5);
    ctx.fillRect(rect.x, rect.y + 5, rect.w, 7);
    ctx.fillRect(rect.x + 3, rect.y + 12, rect.w - 6, 3);
    ctx.fillRect(rect.x + 5, rect.y + 15, 5, 3);
    ctx.fillRect(rect.x + rect.w - 10, rect.y + 15, 5, 3);
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(rect.x + 9, rect.y + 7, 4, 3);
    ctx.fillRect(rect.x + rect.w - 13, rect.y + 7, 4, 3);
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    /* stars */
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let i = 0; i < 40; i++) {
      const x = (i * 137) % W;
      const y = (i * 89) % (H - 90);
      ctx.fillRect(x, y, 2, 2);
    }

    ctx.fillStyle = '#2f7d4f';
    bunkers.forEach((block) => {
      ctx.globalAlpha = 0.35 + block.hp * 0.22;
      ctx.fillRect(block.x, block.y, block.w - 1, block.h - 1);
    });
    ctx.globalAlpha = 1;

    fleet.forEach((alien) => {
      if (alien.alive) drawAlien(alienRect(alien), ROW_COLORS[alien.r % ROW_COLORS.length]);
    });

    ctx.fillStyle = '#f5c451';
    bullets.forEach((bullet) => ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h));

    ctx.fillStyle = '#ff5f6d';
    bombs.forEach((bomb) => ctx.fillRect(bomb.x, bomb.y, bomb.w, bomb.h));

    if (player) {
      ctx.fillStyle = '#3fc9f5';
      ctx.fillRect(player.x, PLAYER_Y + 6, PLAYER_W, 10);
      ctx.fillRect(player.x + PLAYER_W / 2 - 3, PLAYER_Y, 6, 8);
    }

    ctx.fillStyle = 'rgba(67, 209, 122, 0.5)';
    ctx.fillRect(0, PLAYER_Y + PLAYER_H + 6, W, 2);
  }

  const loop = SS.createLoop((dt) => {
    /* Pause and restart are read from every state so P can un-pause too. */
    if (keys.pressed('KeyP') && (state === 'playing' || state === 'paused')) {
      keys.endFrame();
      togglePause();
      draw();
      return;
    }
    if (keys.pressed('KeyR')) {
      keys.endFrame();
      startGame();
      return;
    }
    step(dt);
    keys.endFrame();
    draw();
  });

  pauseBtn.addEventListener('click', togglePause);
  document.getElementById('restart').addEventListener('click', startGame);
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    event.stopPropagation();
    if (state === 'ready' || state === 'over') startGame();
    else if (state === 'paused') togglePause();
  });

  player = { x: W / 2 - PLAYER_W / 2 };
  score = 0;
  lives = 3;
  wave = 1;
  bullets = [];
  bombs = [];
  cooldown = 0;
  resetFleet();
  makeBunkers();
  refreshHud();
  draw();
  loop.start();
})();
