/* Reversi (Othello) — you are black and move first. The CPU searches four moves
   ahead with alpha-beta pruning, scoring corners, mobility and disc count, so it
   plays a sensible game without taking a second to think. */
(function () {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const blackEl = document.getElementById('black');
  const whiteEl = document.getElementById('white');
  const winsEl = document.getElementById('wins');
  const lossesEl = document.getElementById('losses');
  const statusEl = document.getElementById('status');
  const overlay = SS.createOverlay('overlay');

  const SIZE = 8;
  const MARGIN = 8;
  const CELL = (W - MARGIN * 2) / SIZE;
  const EMPTY = 0;
  const PLAYER = 1;   /* black */
  const CPU = 2;      /* white */
  const DEPTH = 4;

  const DIRS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  /* Corners are worth far more than edges; the squares next to a corner are
     traps, because taking them hands the corner over. */
  const WEIGHTS = [
    [120, -20, 20, 5, 5, 20, -20, 120],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [120, -20, 20, 5, 5, 20, -20, 120]
  ];

  let board;
  let turn;
  let state = 'ready'; // ready | playing | over
  let cpuTimer = 0;
  let lastMove = null;
  let record = { wins: 0, losses: 0 };

  const SCORE_KEY = 'supersuite.reversi.record';

  function loadRecord() {
    try {
      const raw = localStorage.getItem(SCORE_KEY);
      if (raw) record = JSON.parse(raw);
    } catch (err) { /* first run */ }
  }

  function saveRecord() {
    try { localStorage.setItem(SCORE_KEY, JSON.stringify(record)); } catch (err) { /* ignore */ }
  }

  /* ---------------------------------------------------------------- rules */

  function flipsFor(board, row, col, player) {
    if (board[row][col] !== EMPTY) return [];
    const found = [];
    for (let d = 0; d < DIRS.length; d++) {
      const dr = DIRS[d][0];
      const dc = DIRS[d][1];
      const line = [];
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r][c] === (player === PLAYER ? CPU : PLAYER)) {
        line.push({ r: r, c: c });
        r += dr;
        c += dc;
      }
      if (line.length && r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r][c] === player) {
        found.push.apply(found, line);
      }
    }
    return found;
  }

  function legalMoves(board, player) {
    const moves = [];
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const flips = flipsFor(board, row, col, player);
        if (flips.length) moves.push({ row: row, col: col, flips: flips });
      }
    }
    return moves;
  }

  function place(board, move, player) {
    board[move.row][move.col] = player;
    move.flips.forEach((cell) => { board[cell.r][cell.c] = player; });
  }

  function copy(board) {
    return board.map((row) => row.slice());
  }

  function counts() {
    let black = 0;
    let white = 0;
    board.forEach((row) => row.forEach((cell) => {
      if (cell === PLAYER) black += 1;
      else if (cell === CPU) white += 1;
    }));
    return { black: black, white: white };
  }

  /* ------------------------------------------------------------------- cpu */

  function evaluate(board) {
    let score = 0;
    let discs = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = board[r][c];
        if (cell === CPU) { score += WEIGHTS[r][c]; discs += 1; }
        else if (cell === PLAYER) { score -= WEIGHTS[r][c]; discs -= 1; }
      }
    }
    const mobility = legalMoves(board, CPU).length - legalMoves(board, PLAYER).length;
    return score + mobility * 12 + discs * 2;
  }

  function search(board, current, depth, alpha, beta) {
    if (depth === 0) return evaluate(board);

    const moves = legalMoves(board, current);
    const other = current === CPU ? PLAYER : CPU;

    if (!moves.length) {
      if (!legalMoves(board, other).length) return evaluate(board);
      return search(board, other, depth - 1, alpha, beta);
    }

    if (current === CPU) {
      let best = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        const next = copy(board);
        place(next, moves[i], current);
        best = Math.max(best, search(next, other, depth - 1, alpha, beta));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    }

    let best = Infinity;
    for (let i = 0; i < moves.length; i++) {
      const next = copy(board);
      place(next, moves[i], current);
      best = Math.min(best, search(next, other, depth - 1, alpha, beta));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  function bestMove() {
    const moves = legalMoves(board, CPU);
    if (!moves.length) return null;
    let pick = moves[0];
    let bestScore = -Infinity;
    moves.forEach((move) => {
      const next = copy(board);
      place(next, move, CPU);
      const score = search(next, PLAYER, DEPTH - 1, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        pick = move;
      }
    });
    return pick;
  }

  /* ------------------------------------------------------------- game flow */

  function refreshHud() {
    const total = counts();
    blackEl.textContent = String(total.black);
    whiteEl.textContent = String(total.white);
    winsEl.textContent = String(record.wins);
    lossesEl.textContent = String(record.losses);
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function startGame() {
    clearTimeout(cpuTimer);
    board = Array.from({ length: SIZE }, () => new Array(SIZE).fill(EMPTY));
    board[3][3] = CPU;
    board[4][4] = CPU;
    board[3][4] = PLAYER;
    board[4][3] = PLAYER;
    turn = PLAYER;
    state = 'playing';
    lastMove = null;
    overlay.hide();
    setStatus('Your move — click a ringed square.');
    refreshHud();
  }

  function gameOver() {
    state = 'over';
    const total = counts();
    if (total.black > total.white) {
      record.wins += 1;
      saveRecord();
      overlay.show('You win!', 'Final score ' + total.black + ' to ' + total.white + '. The CPU wants a rematch.', 'New game', startGame);
    } else if (total.white > total.black) {
      record.losses += 1;
      saveRecord();
      overlay.show('The CPU wins', 'Final score ' + total.white + ' to ' + total.black + '. Corners win games — try holding them.', 'New game', startGame);
    } else {
      overlay.show('A draw', 'Both of you finished on ' + total.black + '. Nobody blinked.', 'New game', startGame);
    }
    setStatus('Game over — ' + counts().black + ' to ' + counts().white + '.');
    refreshHud();
  }

  function advance() {
    if (state !== 'playing') return;
    const moves = legalMoves(board, turn);
    if (moves.length) {
      if (turn === CPU) {
        setStatus('The CPU is thinking…');
        cpuTimer = setTimeout(cpuMove, 380);
      } else {
        setStatus('Your move — click a ringed square.');
      }
      return;
    }

    const other = turn === PLAYER ? CPU : PLAYER;
    if (!legalMoves(board, other).length) {
      gameOver();
      return;
    }
    turn = other;
    setStatus((turn === CPU ? 'The CPU has no move' : 'You have no move') + ' — the turn passes.');
    if (turn === CPU) cpuTimer = setTimeout(cpuMove, 520);
  }

  function cpuMove() {
    if (state !== 'playing' || turn !== CPU) return;
    const move = bestMove();
    if (!move) { advance(); return; }
    place(board, move, CPU);
    lastMove = { row: move.row, col: move.col };
    refreshHud();
    turn = PLAYER;
    advance();
  }

  /* --------------------------------------------------------------- drawing */

  function cellCentre(row, col) {
    return { x: MARGIN + col * CELL + CELL / 2, y: MARGIN + row * CELL + CELL / 2 };
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    /* board */
    ctx.fillStyle = '#123a2b';
    ctx.fillRect(MARGIN, MARGIN, CELL * SIZE, CELL * SIZE);

    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= SIZE; i++) {
      const at = MARGIN + i * CELL;
      ctx.beginPath(); ctx.moveTo(at, MARGIN); ctx.lineTo(at, MARGIN + CELL * SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(MARGIN, at); ctx.lineTo(MARGIN + CELL * SIZE, at); ctx.stroke();
    }

    /* star points */
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    [[2, 2], [2, 6], [6, 2], [6, 6]].forEach(([r, c]) => {
      const p = cellCentre(r, c);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    /* legal moves for the human */
    if (state === 'playing' && turn === PLAYER) {
      legalMoves(board, PLAYER).forEach((move) => {
        const p = cellCentre(move.row, move.col);
        ctx.beginPath();
        ctx.arc(p.x, p.y, CELL * 0.13, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,196,81,0.85)';
        ctx.fill();
      });
    }

    /* discs */
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const cell = board[row][col];
        if (!cell) continue;
        const p = cellCentre(row, col);
        const radius = CELL * 0.38;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = cell === PLAYER ? '#1b2130' : '#f7f9fc';
        ctx.fill();
        ctx.strokeStyle = cell === PLAYER ? '#5d6d7e' : '#c9d2de';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (cell === PLAYER) {
          ctx.beginPath();
          ctx.arc(p.x - radius * 0.25, p.y - radius * 0.25, radius * 0.32, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.16)';
          ctx.fill();
        }
      }
    }

    if (lastMove) {
      const p = cellCentre(lastMove.row, lastMove.col);
      ctx.strokeStyle = 'rgba(245,196,81,0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - CELL / 2 + 2, p.y - CELL / 2 + 2, CELL - 4, CELL - 4);
    }
  }

  /* ---------------------------------------------------------------- input */

  canvas.addEventListener('pointerdown', (event) => {
    if (state !== 'playing' || turn !== PLAYER) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (W / rect.width);
    const y = (event.clientY - rect.top) * (H / rect.height);
    const col = Math.floor((x - MARGIN) / CELL);
    const row = Math.floor((y - MARGIN) / CELL);
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return;

    const move = legalMoves(board, PLAYER).find((candidate) => candidate.row === row && candidate.col === col);
    if (!move) {
      setStatus('That square would not flip anything — look for a ringed one.');
      return;
    }

    place(board, move, PLAYER);
    lastMove = { row: row, col: col };
    refreshHud();
    turn = CPU;
    advance();
  });

  document.getElementById('restart').addEventListener('click', startGame);
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    event.stopPropagation();
    startGame();
  });

  const loop = SS.createLoop(() => {
    draw();
  });

  loadRecord();
  board = Array.from({ length: SIZE }, () => new Array(SIZE).fill(EMPTY));
  board[3][3] = CPU;
  board[4][4] = CPU;
  board[3][4] = PLAYER;
  board[4][3] = PLAYER;
  turn = PLAYER;
  refreshHud();
  draw();
  loop.start();
})();
