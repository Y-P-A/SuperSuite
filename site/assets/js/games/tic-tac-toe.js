/* Tic-Tac-Toe — two players, or a CPU that plays a perfect game. */
(function () {
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const board = document.getElementById('board');
  const turn = document.getElementById('turn');
  const overlay = SS.createOverlay('overlay');

  let cells = new Array(9).fill('');
  let mode = 'cpu';
  let level = 'hard';
  let over = false;
  let busy = false;
  let stats = { wins: 0, losses: 0, draws: 0 };

  function render(winLine) {
    board.innerHTML = cells.map(function (value, index) {
      const cls = value === 'X' ? ' is-x' : value === 'O' ? ' is-o' : '';
      const win = winLine && winLine.indexOf(index) > -1 ? ' is-win' : '';
      return '<button class="ttt__cell' + cls + win + '" type="button" data-index="' + index + '">' + value + '</button>';
    }).join('');
  }

  function winner(state) {
    for (let i = 0; i < LINES.length; i++) {
      const line = LINES[i];
      if (state[line[0]] && state[line[0]] === state[line[1]] && state[line[0]] === state[line[2]]) {
        return { player: state[line[0]], line: line };
      }
    }
    return state.indexOf('') === -1 ? { player: 'draw', line: null } : null;
  }

  /* Score every position from the CPU's side: O maximises, X minimises, and
     `ply` makes a faster win (or a slower loss) score better. */
  function minimax(state, player, ply) {
    const result = winner(state);
    if (result) {
      if (result.player === 'draw') return 0;
      return result.player === 'O' ? 10 - ply : ply - 10;
    }
    const free = [];
    for (let i = 0; i < 9; i++) if (!state[i]) free.push(i);

    let best = player === 'O' ? -Infinity : Infinity;
    free.forEach(function (index) {
      const next = state.slice();
      next[index] = player;
      const score = minimax(next, player === 'O' ? 'X' : 'O', ply + 1);
      best = player === 'O' ? Math.max(best, score) : Math.min(best, score);
    });
    return best;
  }

  function cpuMove() {
    const free = [];
    cells.forEach(function (value, index) { if (!value) free.push(index); });
    if (!free.length) return;

    let choice;
    if (level === 'easy' && Math.random() < 0.65) {
      choice = free[Math.floor(Math.random() * free.length)];
    } else {
      let bestScore = -Infinity;
      free.forEach(function (index) {
        const next = cells.slice();
        next[index] = 'O';
        const score = minimax(next, 'X', 1);
        if (score > bestScore) { bestScore = score; choice = index; }
      });
    }
    place(choice, 'O');
  }

  function place(index, player) {
    if (over || cells[index]) return;
    cells[index] = player;
    const result = winner(cells);
    render(result && result.line);
    if (result) return settle(result);
    turn.textContent = mode === 'friend'
      ? (player === 'X' ? 'O’s turn.' : 'X’s turn.')
      : 'Your turn.';
    if (mode === 'cpu' && player === 'X') {
      busy = true;
      setTimeout(function () { busy = false; cpuMove(); }, 260);
    }
  }

  function settle(result) {
    over = true;
    busy = false;
    if (result.player === 'draw') {
      stats.draws++; turn.textContent = 'It is a draw.';
      overlay.show('Draw', 'Nobody got three in a row.', 'Play again', start);
    } else if (result.player === 'X') {
      stats.wins++;
      turn.textContent = mode === 'friend' ? 'X wins!' : 'You win!';
      overlay.show('X wins', mode === 'friend' ? 'Nice three in a row.' : 'You beat the CPU.', 'Play again', start);
    } else {
      stats.losses++;
      turn.textContent = mode === 'friend' ? 'O wins!' : 'CPU wins.';
      overlay.show('O wins', mode === 'friend' ? 'Three in a row for O.' : 'The CPU got you this time.', 'Play again', start);
    }
    paintStats();
  }

  function paintStats() {
    document.getElementById('wins').textContent = String(stats.wins);
    document.getElementById('losses').textContent = String(stats.losses);
    document.getElementById('draws').textContent = String(stats.draws);
  }

  function start() {
    cells = new Array(9).fill('');
    over = false;
    busy = false;
    turn.textContent = mode === 'friend' ? 'X goes first.' : 'Your turn.';
    render();
    overlay.hide();
  }

  board.addEventListener('click', function (event) {
    const button = event.target.closest('[data-index]');
    if (!button || over || busy) return;
    place(Number(button.getAttribute('data-index')), 'X');
  });

  document.getElementById('new').addEventListener('click', start);
  document.querySelector('[data-overlay-button]').addEventListener('click', start);

  document.getElementById('modes').addEventListener('click', function (event) {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    mode = button.getAttribute('data-mode');
    document.querySelectorAll('#modes .chip').forEach(function (chip) { chip.classList.toggle('is-active', chip === button); });
    document.getElementById('levels').style.display = mode === 'cpu' ? '' : 'none';
    start();
  });
  document.getElementById('levels').addEventListener('click', function (event) {
    const button = event.target.closest('[data-level]');
    if (!button) return;
    level = button.getAttribute('data-level');
    document.querySelectorAll('#levels .chip').forEach(function (chip) { chip.classList.toggle('is-active', chip === button); });
    start();
  });

  render();
  paintStats();
})();
