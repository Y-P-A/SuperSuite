/* Asteroids — a wrapping field, splitting rocks and a simple particle system. */
(function () {
  const W = 640;
  const H = 480;

  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const waveEl = document.getElementById('wave');
  const bestEl = document.getElementById('best');
  const pauseBtn = document.getElementById('pause');

  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  let ship;
  let rocks = [];
  let bullets = [];
  let particles = [];
  let score = 0;
  let lives = 3;
  let wave = 1;
  let state = 'ready';
  let cool = 0;

  function reset() {
    ship = { x: W / 2, y: H / 2, vx: 0, vy: 0, angle: -Math.PI / 2, invuln: 1500 };
    rocks = [];
    bullets = [];
    particles = [];
    score = 0;
    lives = 3;
    wave = 1;
    cool = 0;
    state = 'ready';
    makeWave();
    hud();
  }

  function hud() {
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
    waveEl.textContent = String(wave);
    bestEl.textContent = String(Math.max(SS.best.get('asteroids', 0), score));
  }

  function start() {
    reset();
    state = 'playing';
    pauseBtn.textContent = 'Pause';
    overlay.hide();
  }

  function makeWave() {
    for (let i = 0; i < 3 + wave; i++) {
      let x;
      let y;
      do {
        x = Math.random() * W;
        y = Math.random() * H;
      } while (Math.hypot(x - W / 2, y - H / 2) < 130);
      rocks.push(makeRock(x, y, 40));
    }
  }

  function makeRock(x, y, size) {
    const speed = 34 + Math.random() * 34 + wave * 6;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: x, y: y, size: size,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spin: (Math.random() - 0.5) * 2,
      angle: Math.random() * Math.PI * 2,
      shape: new Array(7).fill(0).map(function () { return 0.72 + Math.random() * 0.45; })
    };
  }

  function wrap(entity) {
    if (entity.x < 0) entity.x += W;
    if (entity.x > W) entity.x -= W;
    if (entity.y < 0) entity.y += H;
    if (entity.y > H) entity.y -= H;
  }

  function fire() {
    if (cool > 0 || state !== 'playing') return;
    cool = 180;
    bullets.push({
      x: ship.x + Math.cos(ship.angle) * 14,
      y: ship.y + Math.sin(ship.angle) * 14,
      vx: Math.cos(ship.angle) * 520 + ship.vx * 0.4,
      vy: Math.sin(ship.angle) * 520 + ship.vy * 0.4,
      life: 950
    });
  }

  function split(rock) {
    score += rock.size > 24 ? 20 : 50;
    for (let i = 0; i < 3; i++) burst(rock.x, rock.y);
    if (rock.size > 24) {
      for (let i = 0; i < 2; i++) rocks.push(makeRock(rock.x, rock.y, rock.size / 2));
    }
    hud();
  }

  function burst(x, y) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 160,
      vy: (Math.random() - 0.5) * 160,
      life: 500 + Math.random() * 300
    });
  }

  function hit() {
    lives--;
    hud();
    for (let i = 0; i < 16; i++) burst(ship.x, ship.y);
    if (lives <= 0) {
      const best = SS.best.get('asteroids', 0);
      if (score > best) SS.best.set('asteroids', score);
      hud();
      state = 'over';
      overlay.show('Game over', 'Score: ' + score + ' · wave ' + wave + '.', 'Try again', start);
      return;
    }
    ship.x = W / 2;
    ship.y = H / 2;
    ship.vx = 0;
    ship.vy = 0;
    ship.invuln = 1800;
  }

  function update(dt) {
    const s = dt / 1000;

    if (keys.isDown('ArrowLeft') || keys.isDown('KeyA')) ship.angle -= 3.4 * s;
    if (keys.isDown('ArrowRight') || keys.isDown('KeyD')) ship.angle += 3.4 * s;
    if (keys.isDown('ArrowUp') || keys.isDown('KeyW')) {
      ship.vx += Math.cos(ship.angle) * 190 * s;
      ship.vy += Math.sin(ship.angle) * 190 * s;
    }
    ship.vx *= 0.995;
    ship.vy *= 0.995;
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed > 300) { ship.vx *= 300 / speed; ship.vy *= 300 / speed; }
    ship.x += ship.vx * s;
    ship.y += ship.vy * s;
    wrap(ship);
    if (ship.invuln > 0) ship.invuln -= dt;

    cool -= dt;
    if (keys.isDown('Space')) fire();

    bullets.forEach(function (bullet) {
      bullet.x += bullet.vx * s;
      bullet.y += bullet.vy * s;
      bullet.life -= dt;
      wrap(bullet);
    });

    rocks.forEach(function (rock) {
      rock.x += rock.vx * s;
      rock.y += rock.vy * s;
      rock.angle += rock.spin * s;
      wrap(rock);
    });

    particles.forEach(function (particle) {
      particle.x += particle.vx * s;
      particle.y += particle.vy * s;
      particle.vx *= 0.97;
      particle.vy *= 0.97;
      particle.life -= dt;
    });
    particles = particles.filter(function (particle) { return particle.life > 0; });
    bullets = bullets.filter(function (bullet) { return bullet.life > 0; });

    for (let i = bullets.length - 1; i >= 0; i--) {
      for (let j = rocks.length - 1; j >= 0; j--) {
        if (Math.hypot(bullets[i].x - rocks[j].x, bullets[i].y - rocks[j].y) < rocks[j].size * 0.85) {
          split(rocks[j]);
          rocks.splice(j, 1);
          bullets.splice(i, 1);
          break;
        }
      }
    }

    if (ship.invuln <= 0) {
      for (let i = 0; i < rocks.length; i++) {
        if (Math.hypot(ship.x - rocks[i].x, ship.y - rocks[i].y) < rocks[i].size * 0.8 + 7) {
          hit();
          break;
        }
      }
    }

    if (!rocks.length && state === 'playing') {
      wave++;
      hud();
      makeWave();
      SS.toast('Wave ' + wave);
    }
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 40; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    ctx.strokeStyle = '#93a1ad';
    rocks.forEach(function (rock) {
      ctx.save();
      ctx.translate(rock.x, rock.y);
      ctx.rotate(rock.angle);
      ctx.beginPath();
      for (let i = 0; i < rock.shape.length; i++) {
        const angle = (i / rock.shape.length) * Math.PI * 2;
        const radius = rock.size * rock.shape[i];
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    ctx.fillStyle = '#f1c40f';
    bullets.forEach(function (bullet) {
      ctx.fillRect(bullet.x - 1.5, bullet.y - 1.5, 3, 3);
    });

    ctx.fillStyle = '#e67e22';
    particles.forEach(function (particle) {
      ctx.fillRect(particle.x, particle.y, 2, 2);
    });

    if (state !== 'over' && (ship.invuln <= 0 || Math.floor(ship.invuln / 120) % 2 === 0)) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.strokeStyle = '#27ae60';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-9, 9);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-9, -9);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
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
  loop.start();
})();
