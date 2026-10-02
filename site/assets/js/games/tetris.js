/* Tetris — 10x20 well, seven-bag randomiser, ghost piece, classic scoring. */
(function () {
  const COLS = 10;
  const ROWS = 20;
  const CELL = 30;

  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const nextCanvas = document.getElementById('next');
  const nctx = nextCanvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const linesEl = document.getElementById('lines');
  const levelEl = document.getElementById('level');
  const bestEl = document.getElementById('best');
  const pauseBtn = document.getElementById('pause');

  const SHAPES = {
    I: { color: '#16a085', cells: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
    J: { color: '#2980b9', cells: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
    L: { color: '#e67e22', cells: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
    O: { color: '#f1c40f', cells: [[1, 1], [1, 1]] },
    S: { color: '#27ae60', cells: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
    T: { color: '#8e44ad', cells: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
    Z: { color: '#c0392b', cells: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] }
  };
  const TYPES = Object.keys(SHAPES);
  const LINE_SCORES = [0, 100, 300, 500, 800];

  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  let grid = [];
  let bag = [];
  let piece = null;
  let nextType = null;
  let score = 0;
  let lines = 0;
  let level = 1;
  let state = 'ready'; // ready | playing | paused | over
  let dropTimer = 0;

  function emptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function nextFromBag() {
    if (!bag.length) {
      bag = TYPES.slice();
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  }

  function makePiece(type) {
    const shape = SHAPES[type];
    const cells = shape.cells.map((row) => row.slice());
    return {
      type: type,
      color: shape.color,
      cells: cells,
      x: Math.floor((COLS - cells[0].length) / 2),
      y: type === 'I' ? -1 : 0
    };
  }

  function rotateCW(cells) {
    const n = cells.length;
    const out = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        out[c][n - 1 - r] = cells[r][c];
      }
    }
    return out;
  }

  function rotateCCW(cells) {
    const n = cells.length;
    const out = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        out[n - 1 - c][r] = cells[r][c];
      }
    }
    return out;
  }

  function collides(cells, offsetX, offsetY) {
    for (let r = 0; r < cells.length; r++) {
      for (let c = 0; c < cells[r].length; c++) {
        if (!cells[r][c]) continue;
        const x = offsetX + c;
        const y = offsetY + r;
        if (x < 0 || x >= COLS || y >= ROWS) return true;
        if (y >= 0 && grid[y][x]) return true;
      }
    }
    return false;
  }

  function spawn() {
    piece = makePiece(nextType || nextFromBag());
    nextType = nextFromBag();
    dropTimer = 0;
    drawNext();
    if (collides(piece.cells, piece.x, piece.y)) {
      gameOver();
    }
  }

  function lockPiece() {
    piece.cells.forEach((row, r) => {
      row.forEach((value, c) => {
        if (!value) return;
        const y = piece.y + r;
        const x = piece.x + c;
        if (y >= 0) grid[y][x] = piece.color;
      });
    });
    clearLines();
    spawn();
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r].every((cell) => cell)) {
        grid.splice(r, 1);
        grid.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }
    if (!cleared) return;

    lines += cleared;
    score += LINE_SCORES[cleared] * level;
    level = Math.floor(lines / 10) + 1;
    refreshHud();
  }

  function tryMove(dx, dy) {
    if (!collides(piece.cells, piece.x + dx, piece.y + dy)) {
      piece.x += dx;
      piece.y += dy;
      return true;
    }
    return false;
  }

  function tryRotate(clockwise) {
    const rotated = clockwise ? rotateCW(piece.cells) : rotateCCW(piece.cells);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!collides(rotated, piece.x + kick, piece.y)) {
        piece.cells = rotated;
        piece.x += kick;
        return;
      }
    }
  }

  function hardDrop() {
    let dropped = 0;
    while (tryMove(0, 1)) dropped++;
    score += dropped * 2;
    refreshHud();
    lockPiece();
  }

  function gravityInterval() {
    return Math.max(90, 800 - (level - 1) * 65);
  }

  function step() {
    if (!tryMove(0, 1)) lockPiece();
  }

  function refreshHud() {
    scoreEl.textContent = String(score);
    linesEl.textContent = String(lines);
    levelEl.textContent = String(level);
    const best = SS.best.get('tetris', 0);
    bestEl.textContent = String(Math.max(best, score));
  }

  /* ---------- drawing ---------- */
  function drawCell(target, x, y, color, size, ghost) {
    if (ghost) {
      target.strokeStyle = color;
      target.lineWidth = 2;
      target.strokeRect(x + 2, y + 2, size - 4, size - 4);
      return;
    }
    target.fillStyle = color;
    target.fillRect(x, y, size, size);
    target.fillStyle = 'rgba(255,255,255,0.28)';
    target.fillRect(x, y, size, Math.max(2, size * 0.14));
    target.fillRect(x, y, Math.max(2, size * 0.14), size);
    target.strokeStyle = 'rgba(15,22,38,0.55)';
    target.lineWidth = 1;
    target.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL + 0.5, 0);
      ctx.lineTo(c * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL + 0.5);
      ctx.lineTo(COLS * CELL, r * CELL + 0.5);
      ctx.stroke();
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) drawCell(ctx, c * CELL, r * CELL, grid[r][c], CELL, false);
      }
    }

    if (piece && state !== 'over') {
      let ghostY = piece.y;
      while (!collides(piece.cells, piece.x, ghostY + 1)) ghostY++;
      piece.cells.forEach((row, r) => {
        row.forEach((value, c) => {
          if (value && ghostY + r >= 0) {
            drawCell(ctx, (piece.x + c) * CELL, (ghostY + r) * CELL, piece.color, CELL, true);
          }
        });
      });

      piece.cells.forEach((row, r) => {
        row.forEach((value, c) => {
          if (value && piece.y + r >= 0) {
            drawCell(ctx, (piece.x + c) * CELL, (piece.y + r) * CELL, piece.color, CELL, false);
          }
        });
      });
    }
  }

  function drawNext() {
    nctx.fillStyle = '#0f1626';
    nctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextType) return;
    const cells = SHAPES[nextType].cells;
    const size = 20;
    const columns = cells[0].length;
    const rows = cells.length;
    const offsetX = (nextCanvas.width - columns * size) / 2;
    const offsetY = (nextCanvas.height - rows * size) / 2;
    cells.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value) drawCell(nctx, offsetX + c * size, offsetY + r * size, SHAPES[nextType].color, size, false);
      });
    });
  }

  /* ---------- state transitions ---------- */
  function start() {
    grid = emptyGrid();
    bag = [];
    score = 0;
    lines = 0;
    level = 1;
    state = 'playing';
    nextType = nextFromBag();
    spawn();
    refreshHud();
    overlay.hide();
    pauseBtn.textContent = 'Pause';
  }

  function gameOver() {
    state = 'over';
    keys.clear();
    const best = SS.best.get('tetris', 0);
    if (score > best) SS.best.set('tetris', score);
    refreshHud();
    overlay.show('Game over', 'Score ' + score + ' — best ' + Math.max(best, score) + '.', 'Play again', start);
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
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    if (state === 'ready' || state === 'over') start();
    else if (state === 'paused') togglePause();
    event.stopPropagation();
  });

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
      start();
      return;
    }

    if (state !== 'playing') {
      keys.endFrame();
      draw();
      return;
    }

    if (keys.isDown('ArrowLeft')) tryMove(-1, 0);
    if (keys.isDown('ArrowRight')) tryMove(1, 0);
    if (keys.pressed('ArrowUp') || keys.pressed('KeyX')) tryRotate(true);
    if (keys.pressed('KeyZ')) tryRotate(false);

    const softDrop = keys.isDown('ArrowDown');
    if (softDrop) {
      if (tryMove(0, 1)) score++;
      dropTimer = 0;
    }

    if (keys.pressed('Space')) {
      hardDrop();
    } else {
      dropTimer += dt;
      if (dropTimer >= gravityInterval()) {
        dropTimer = 0;
        step();
      }
    }

    keys.endFrame();
    refreshHud();
    draw();
  });

  grid = emptyGrid();
  nextType = nextFromBag();
  drawNext();
  refreshHud();
  draw();
  loop.start();
})();
