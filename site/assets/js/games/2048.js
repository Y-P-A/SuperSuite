/* 2048 — the classic sliding tile puzzle, DOM based. */
(function () {
  const SIZE = 4;
  const board = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const topEl = document.getElementById('top');
  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  const COLORS = {
    2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f',
    64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850',
    1024: '#edc53f', 2048: '#edc22e'
  };

  let grid = [];
  let score = 0;
  let state = 'ready';
  let won = false;

  function emptyGrid() {
    const cells = [];
    for (let i = 0; i < SIZE * SIZE; i++) cells.push(0);
    return cells;
  }

  function spawn() {
    const free = [];
    grid.forEach(function (value, index) { if (!value) free.push(index); });
    if (!free.length) return;
    const index = free[Math.floor(Math.random() * free.length)];
    grid[index] = Math.random() < 0.9 ? 2 : 4;
  }

  function start() {
    grid = emptyGrid();
    score = 0;
    won = false;
    state = 'playing';
    spawn();
    spawn();
    overlay.hide();
    render();
  }

  function slide(line) {
    const values = line.filter(function (v) { return v; });
    const out = [];
    let gained = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1]) {
        out.push(values[i] * 2);
        gained += values[i] * 2;
        if (values[i] * 2 === 2048) won = true;
        i++;
      } else {
        out.push(values[i]);
      }
    }
    while (out.length < SIZE) out.push(0);
    return { line: out, gained: gained };
  }

  function move(direction) {
    if (state !== 'playing') return;
    const before = grid.join(',');
    let gained = 0;

    for (let i = 0; i < SIZE; i++) {
      const indices = [];
      for (let j = 0; j < SIZE; j++) {
        if (direction === 'left') indices.push(i * SIZE + j);
        else if (direction === 'right') indices.push(i * SIZE + (SIZE - 1 - j));
        else if (direction === 'up') indices.push(j * SIZE + i);
        else indices.push((SIZE - 1 - j) * SIZE + i);
      }
      const result = slide(indices.map(function (index) { return grid[index]; }));
      gained += result.gained;
      indices.forEach(function (index, position) { grid[index] = result.line[position]; });
    }

    if (grid.join(',') === before) return;
    score += gained;
    spawn();
    render();
    if (won) { finish(true); return; }
    if (!canMove()) finish(false);
  }

  function canMove() {
    if (grid.indexOf(0) > -1) return true;
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const value = grid[i * SIZE + j];
        if (j < SIZE - 1 && value === grid[i * SIZE + j + 1]) return true;
        if (i < SIZE - 1 && value === grid[(i + 1) * SIZE + j]) return true;
      }
    }
    return false;
  }

  function finish(victory) {
    state = 'over';
    const best = SS.best.get('2048', 0);
    if (score > best) SS.best.set('2048', score);
    render();
    overlay.show(victory ? 'You made 2048!' : 'No moves left',
      'Score: ' + score + ' · best tile ' + Math.max.apply(null, grid) + '.',
      'New game', start);
  }

  function render() {
    board.innerHTML = grid.map(function (value) {
      if (!value) return '<div class="tile tile--empty"></div>';
      const size = value >= 1024 ? '1.05rem' : value >= 128 ? '1.3rem' : '1.6rem';
      return '<div class="tile" style="background:' + (COLORS[value] || '#3c3a32') +
        ';color:' + (value <= 4 ? '#776e65' : '#fff') + ';font-size:' + size + '">' + value + '</div>';
    }).join('');
    scoreEl.textContent = String(score);
    bestEl.textContent = String(Math.max(SS.best.get('2048', 0), score));
    topEl.textContent = String(Math.max.apply(null, grid) || 0);
  }

  /* ---- swipe ---- */
  let touch = null;
  board.addEventListener('pointerdown', function (event) { touch = { x: event.clientX, y: event.clientY }; });
  board.addEventListener('pointerup', function (event) {
    if (!touch) return;
    const dx = event.clientX - touch.x;
    const dy = event.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });

  document.getElementById('restart').addEventListener('click', start);
  document.querySelector('[data-overlay-button]').addEventListener('click', start);

  const loop = SS.createLoop(function () {
    if (keys.pressed('KeyR')) { keys.endFrame(); start(); return; }
    if (state === 'playing') {
      if (keys.pressed('ArrowLeft') || keys.pressed('KeyA')) move('left');
      else if (keys.pressed('ArrowRight') || keys.pressed('KeyD')) move('right');
      else if (keys.pressed('ArrowUp') || keys.pressed('KeyW')) move('up');
      else if (keys.pressed('ArrowDown') || keys.pressed('KeyS')) move('down');
    }
    keys.endFrame();
  });

  grid = emptyGrid();
  spawn();
  spawn();
  render();
  loop.start();
})();
