/* Aim Trainer — thirty seconds, one target at a time, and it shrinks as your
   score climbs. Every click that misses costs accuracy. */
(function () {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const timeEl = document.getElementById('time');
  const scoreEl = document.getElementById('score');
  const accuracyEl = document.getElementById('accuracy');
  const bestEl = document.getElementById('best');
  const overlay = SS.createOverlay('overlay');

  const ROUND = 30;

  let state = 'ready'; // ready | playing | over
  let hits = 0;
  let misses = 0;
  let remaining = ROUND;
  let target = null;
  let flash = 0;

  function radius() {
    return Math.max(13, 34 - hits * 0.7);
  }

  function spawn() {
    const r = radius();
    const pad = r + 12;
    target = {
      x: pad + Math.random() * (W - pad * 2),
      y: pad + Math.random() * (H - pad * 2),
      r: r
    };
  }

  function accuracy() {
    const shots = hits + misses;
    return shots === 0 ? 100 : Math.round(hits / shots * 100);
  }

  function refresh() {
    timeEl.textContent = remaining.toFixed(1);
    scoreEl.textContent = String(hits);
    accuracyEl.textContent = accuracy() + '%';
    bestEl.textContent = String(Math.max(SS.best.get('aim-trainer', 0), hits));
  }

  function startGame() {
    hits = 0;
    misses = 0;
    remaining = ROUND;
    flash = 0;
    state = 'playing';
    spawn();
    overlay.hide();
    refresh();
  }

  function finish() {
    state = 'over';
    const record = SS.best.get('aim-trainer', 0);
    const better = hits > record;
    if (better) SS.best.set('aim-trainer', hits);
    refresh();
    overlay.show(better ? 'New best!' : 'Time up',
      'You hit ' + hits + ' target' + (hits === 1 ? '' : 's') + ' with ' + accuracy() + '% accuracy' +
      (better ? ' — a new record.' : '. Best so far: ' + record + '.'),
      'Go again', startGame);
  }

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (W / rect.width),
      y: (event.clientY - rect.top) * (H / rect.height)
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (state !== 'playing') return;
    event.preventDefault();
    const p = point(event);
    if (target && Math.hypot(p.x - target.x, p.y - target.y) <= target.r) {
      hits += 1;
      flash = 140;
      spawn();
    } else {
      misses += 1;
    }
    refresh();
  });

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  function drawTarget() {
    if (!target) return;
    const rings = [
      { scale: 1, color: '#ff5f6d' },
      { scale: 0.66, color: '#f7f9fc' },
      { scale: 0.33, color: '#ff5f6d' }
    ];
    rings.forEach((ring) => {
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.r * ring.scale, 0, Math.PI * 2);
      ctx.fillStyle = ring.color;
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const at = (W / 8) * i;
      ctx.beginPath(); ctx.moveTo(at, 0); ctx.lineTo(at, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, at); ctx.lineTo(W, at); ctx.stroke();
    }

    if (flash > 0) {
      ctx.fillStyle = 'rgba(67, 209, 122, ' + (flash / 140 * 0.18) + ')';
      ctx.fillRect(0, 0, W, H);
    }

    if (state === 'playing') drawTarget();

    /* time bar */
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, H - 8, W, 8);
    ctx.fillStyle = remaining > 10 ? '#43d17a' : '#ff9f43';
    ctx.fillRect(0, H - 8, W * Math.max(remaining, 0) / ROUND, 8);
  }

  const loop = SS.createLoop((dt) => {
    if (state === 'playing') {
      remaining -= dt / 1000;
      flash = Math.max(0, flash - dt);
      if (remaining <= 0) {
        remaining = 0;
        finish();
      }
    }
    draw();
  });

  document.getElementById('restart').addEventListener('click', startGame);
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    event.stopPropagation();
    startGame();
  });

  refresh();
  draw();
  loop.start();
})();
