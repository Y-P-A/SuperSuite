/* Lights Out — every click flips a cross of five squares. The puzzles are made
   by flipping squares from a solved board, so they can always be solved. */
(function () {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const SIZE = 5;
  const PAD = 20;
  const CELL = (W - PAD * 2) / SIZE;

  const movesEl = document.getElementById('moves');
  const litEl = document.getElementById('lit');
  const bestEl = document.getElementById('best');

  const keys = SS.createKeys();
  const overlay = SS.createOverlay('overlay');

  let grid = [];
  let moves = 0;
  let state = 'ready'; // ready | playing | over
  let hover = null;

  function blank() {
    return Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
  }

  function flip(row, col) {
    const spots = [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
    spots.forEach(([r, c]) => {
      if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) grid[r][c] = !grid[r][c];
    });
  }

  function litCount() {
    return grid.reduce((total, row) => total + row.filter(Boolean).length, 0);
  }

  function refreshHud() {
    movesEl.textContent = String(moves);
    litEl.textContent = String(litCount());
    const record = SS.best.get('lights-out', 0);
    bestEl.textContent = record ? String(record) : '—';
  }

  function scramble() {
    /* A solved board, then a run of random flips — always solvable. */
    do {
      grid = blank();
      const flips = 6 + Math.floor(Math.random() * 5);
      for (let i = 0; i < flips; i++) {
        flip(Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE));
      }
    } while (litCount() === 0);
  }

  function startGame() {
    scramble();
    moves = 0;
    state = 'playing';
    overlay.hide();
    refreshHud();
  }

  function win() {
    state = 'over';
    const record = SS.best.get('lights-out', 0);
    const better = !record || moves < record;
    if (better) SS.best.set('lights-out', moves);
    refreshHud();
    overlay.show(better ? 'New best!' : 'Lights out',
      'You cleared the board in ' + moves + ' move' + (moves === 1 ? '' : 's') + '.' +
      (better ? ' That is a new record.' : ' Fewest so far: ' + record + '.'),
      'New puzzle', startGame);
  }

  function play(row, col) {
    if (state !== 'playing') return;
    flip(row, col);
    moves += 1;
    refreshHud();
    if (litCount() === 0) win();
  }

  function cellAt(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (W / rect.width);
    const y = (event.clientY - rect.top) * (H / rect.height);
    const col = Math.floor((x - PAD) / CELL);
    const row = Math.floor((y - PAD) / CELL);
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return null;
    return { row: row, col: col };
  }

  canvas.addEventListener('click', (event) => {
    const cell = cellAt(event);
    if (cell) play(cell.row, cell.col);
  });

  canvas.addEventListener('pointermove', (event) => {
    hover = cellAt(event);
  });

  canvas.addEventListener('pointerleave', () => { hover = null; });

  document.getElementById('restart').addEventListener('click', startGame);
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    event.stopPropagation();
    startGame();
  });

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const x = PAD + col * CELL;
        const y = PAD + row * CELL;
        const on = grid[row][col];
        const isHover = hover && hover.row === row && hover.col === col;

        ctx.fillStyle = on ? '#f5c451' : (isHover ? '#243049' : '#1b2438');
        ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);

        ctx.strokeStyle = on ? '#fff6d6' : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);

        if (on) {
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.fillRect(x + CELL / 2 - 9, y + CELL / 2 - 2, 18, 4);
          ctx.fillRect(x + CELL / 2 - 2, y + CELL / 2 - 9, 4, 18);
        }
      }
    }
  }

  const loop = SS.createLoop(() => {
    if (keys.pressed('KeyR')) {
      keys.endFrame();
      startGame();
      return;
    }
    keys.endFrame();
    draw();
  });

  grid = blank();
  refreshHud();
  draw();
  loop.start();
})();
