/* Jumper — bounce upward forever, with a camera that follows the climb. */
(function () {
  const W = 380;
  const H = 520;
  const GRAVITY = 1500;
  const BOUNCE = -720;

  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const pauseBtn = document.getElementById('pause');

  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  let player;
  let platforms = [];
  let camera = 0;
  let highest = 0;
  let state = 'ready';

  function reset() {
    player = { x: W / 2, y: H - 90, vx: 0, vy: BOUNCE };
    platforms = [];
    for (let i = 0; i < 9; i++) {
      platforms.push({ x: Math.random() * (W - 92), y: H - 40 - i * 72, w: 92, h: 12, bounce: i === 0 });
    }
    camera = 0;
    highest = 0;
    state = 'ready';
    hud();
  }

  function hud() {
    scoreEl.textContent = String(Math.max(0, Math.floor(highest / 10)));
    bestEl.textContent = String(Math.max(SS.best.get('jumper', 0), Math.floor(highest / 10)));
  }

  function start() {
    reset();
    state = 'playing';
    pauseBtn.textContent = 'Pause';
    overlay.hide();
  }

  function finish() {
    state = 'over';
    const score = Math.max(0, Math.floor(highest / 10));
    const best = SS.best.get('jumper', 0);
    if (score > best) SS.best.set('jumper', score);
    hud();
    overlay.show('Nice climb', 'You reached ' + score + '. Best: ' + Math.max(best, score) + '.', 'Try again', start);
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

  function update(dt) {
    const s = dt / 1000;

    const drift = (keys.isDown('ArrowLeft') || keys.isDown('KeyA') ? -1 : 0) +
      (keys.isDown('ArrowRight') || keys.isDown('KeyD') ? 1 : 0);
    player.vx += drift * 1600 * s;
    player.vx *= 0.86;
    player.vx = Math.max(-330, Math.min(330, player.vx));

    player.x += player.vx * s;
    if (player.x < -16) player.x = W + 16;
    if (player.x > W + 16) player.x = -16;

    player.vy += GRAVITY * s;
    player.y += player.vy * s;

    /* Rising: push the camera up and spawn new platforms above. */
    if (player.y < H * 0.45) {
      const delta = H * 0.45 - player.y;
      player.y = H * 0.45;
      camera += delta;
      platforms.forEach(function (platform) { platform.y += delta; });
      highest += delta;
    }

    platforms.forEach(function (platform) {
      if (player.vy > 0 &&
          player.x > platform.x - 12 && player.x < platform.x + platform.w + 12 &&
          player.y + 14 > platform.y && player.y + 14 < platform.y + platform.h + 12) {
        player.y = platform.y - 14;
        player.vy = platform.bounce ? BOUNCE * 1.25 : BOUNCE;
      }
    });

    platforms = platforms.filter(function (platform) { return platform.y < H + 60; });
    while (platforms.length < 9) {
      const top = platforms.length
        ? Math.min.apply(null, platforms.map(function (p) { return p.y; }))
        : H - 60;
      platforms.push({
        x: Math.random() * (W - 92),
        y: top - (58 + Math.random() * 46),
        w: 92,
        h: 12,
        bounce: Math.random() < 0.14
      });
    }

    if (player.y > H + 40) finish();
    hud();
  }

  function draw() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0b1a2b');
    sky.addColorStop(1, '#1c3c5a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    platforms.forEach(function (platform) {
      ctx.fillStyle = platform.bounce ? '#f1c40f' : '#27ae60';
      ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(platform.x, platform.y + platform.h - 3, platform.w, 3);
    });

    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(player.x - 4, player.y - 3, 2, 0, Math.PI * 2);
    ctx.arc(player.x + 4, player.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  pauseBtn.addEventListener('click', togglePause);
  document.getElementById('restart').addEventListener('click', start);
  document.querySelector('[data-overlay-button]').addEventListener('click', function (event) {
    event.stopPropagation();
    if (state === 'paused') togglePause(); else start();
  });

  const loop = SS.createLoop(function (dt) {
    if (keys.pressed('KeyP') && (state === 'playing' || state === 'paused')) {
      keys.endFrame(); togglePause(); draw(); return;
    }
    if (keys.pressed('KeyR')) { keys.endFrame(); start(); draw(); return; }
    if (state === 'playing') update(dt);
    keys.endFrame();
    draw();
  });

  reset();
  draw();
  loop.start();
})();
