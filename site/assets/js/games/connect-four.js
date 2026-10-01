/* Connect Four — 7x6 board, a CPU that takes the win and blocks yours. */
(function () {
  const COLS = 7;
  const ROWS = 6;
  const board = document.getElementById('board');
  const turn = document.getElementById('turn');
  const overlay = SS.createOverlay('overlay');

  let grid = [];
  let mode = 'cpu';
  let over = false;
  let busy = false;
  let stats = { wins: 0, losses: 0, draws: 0 };

  function empty() {
    const cells = [];
    for (let i = 0; i < ROWS * COLS; i++) cells.push('');
    return cells;
  }

  function at(row, col) { return grid[row * COLS + col]; }
  function set(row, col, value) { grid[row * COLS + col] = value; }

  function dropRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!at(row, col)) return row;
    }
    return -1;
  }

  function render(winning) {
    let html = '';
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const value = at(row, col);
        const win = winning && winning.some(function (cell) { return cell[0] === row && cell[1] === col; });
        html += '<button class="cf__cell" type="button" data-col="' + col + '" aria-label="Column ' + (col + 1) + '">' +
          '<span class="cf__disc' + (value ? ' cf__disc--' + value.toLowerCase() : '') + (win ? ' is-win' : '') + '"></span>' +
          '</button>';
      }
    }
    board.innerHTML = html;
  }

  function winFrom(row, col) {
    const player = at(row, col);
    if (!player) return null;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let d = 0; d < directions.length; d++) {
      const dr = directions[d][0];
      const dc = directions[d][1];
      const line = [[row, col]];
      for (let sign = -1; sign <= 1; sign += 2) {
        let r = row + dr * sign;
        let c = col + dc * sign;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && at(r, c) === player) {
          line.push([r, c]);
          r += dr * sign;
          c += dc * sign;
        }
      }
      if (line.length >= 4) return line;
    }
    return null;
  }

  function place(col, player) {
    const row = dropRow(col);
    if (row < 0) return false;
    set(row, col, player);
    const win = winFrom(row, col);
    render(win);
    if (win) { settle(player, win); return true; }
    if (grid.indexOf('') === -1) { settle('draw', null); return true; }
    return true;
  }

  function settle(result, win) {
    over = true;
    busy = false;
    if (result === 'draw') {
      stats.draws++;
      turn.textContent = 'The board is full — a draw.';
      overlay.show('Draw', 'Every column is stacked. Nobody connected four.', 'Play again', start);
    } else if (result === 'R') {
      stats.wins++;
      turn.textContent = mode === 'friend' ? 'Red wins!' : 'You win!';
      overlay.show('Red wins', mode === 'friend' ? 'Four in a row for red.' : 'You connected four — nice.', 'Play again', start);
    } else {
      stats.losses++;
      turn.textContent = mode === 'friend' ? 'Yellow wins!' : 'CPU wins.';
      overlay.show('Yellow wins', mode === 'friend' ? 'Four in a row for yellow.' : 'The CPU connected four first.', 'Play again', start);
    }
    paintStats();
  }

  function scoreMove(col, player) {
    const row = dropRow(col);
    if (row < 0) return -Infinity;
    set(row, col, player);
    let score = 0;
    const win = winFrom(row, col);
    if (win) score = 1000;
    else {
      const centre = Math.abs(col - 3);
      score = 10 - centre * 2 + row;
    }
    set(row, col, '');
    return score;
  }

  function cpuMove() {
    const options = [];
    for (let col = 0; col < COLS; col++) if (dropRow(col) >= 0) options.push(col);
    if (!options.length) return;

    // Take an immediate win, otherwise block one, otherwise play the best spot.
    for (let i = 0; i < options.length; i++) {
      const col = options[i];
      const row = dropRow(col);
      set(row, col, 'Y');
      const wins = winFrom(row, col);
      set(row, col, '');
      if (wins) { place(col, 'Y'); return; }
    }
    for (let i = 0; i < options.length; i++) {
      const col = options[i];
      const row = dropRow(col);
      set(row, col, 'R');
      const wins = winFrom(row, col);
      set(row, col, '');
      if (wins) { place(col, 'Y'); return; }
    }

    let best = options[0];
    let bestScore = -Infinity;
    options.forEach(function (col) {
      const score = scoreMove(col, 'Y') + Math.random();
      if (score > bestScore) { bestScore = score; best = col; }
    });
    place(best, 'Y');
  }

  function play(col, player) {
    if (over || busy || dropRow(col) < 0) return;
    place(col, player);
    if (over) return;
    if (mode === 'cpu' && player === 'R') {
      busy = true;
      turn.textContent = 'CPU is thinking…';
      setTimeout(function () { busy = false; cpuMove(); if (!over) turn.textContent = 'Your turn — pick a column.'; }, 320);
    } else {
      turn.textContent = mode === 'friend'
        ? (player === 'R' ? 'Yellow’s turn.' : 'Red’s turn.')
        : 'Your turn — pick a column.';
    }
  }

  function paintStats() {
    document.getElementById('wins').textContent = String(stats.wins);
    document.getElementById('losses').textContent = String(stats.losses);
    document.getElementById('draws').textContent = String(stats.draws);
  }

  function start() {
    grid = empty();
    over = false;
    busy = false;
    turn.textContent = mode === 'friend' ? 'Red goes first.' : 'Your turn — pick a column.';
    render();
    overlay.hide();
  }

  board.addEventListener('click', function (event) {
    const button = event.target.closest('[data-col]');
    if (button) play(Number(button.getAttribute('data-col')), 'R');
  });

  document.getElementById('new').addEventListener('click', start);
  document.querySelector('[data-overlay-button]').addEventListener('click', start);
  document.getElementById('modes').addEventListener('click', function (event) {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    mode = button.getAttribute('data-mode');
    document.querySelectorAll('#modes .chip').forEach(function (chip) { chip.classList.toggle('is-active', chip === button); });
    start();
  });

  grid = empty();
  render();
  paintStats();
})();
