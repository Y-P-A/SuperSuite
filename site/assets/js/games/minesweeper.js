/* Minesweeper — three difficulties, safe first click, flood fill reveal. */
(function () {
  const LEVELS = {
    easy: { cols: 9, rows: 9, mines: 10, name: 'easy' },
    medium: { cols: 16, rows: 16, mines: 40, name: 'medium' },
    hard: { cols: 30, rows: 16, mines: 99, name: 'hard' }
  };

  const board = document.getElementById('board');
  const minesEl = document.getElementById('mines');
  const timeEl = document.getElementById('time');
  const bestEl = document.getElementById('best');
  const status = document.getElementById('status');

  let level = 'easy';
  let cells = [];
  let cols = 9;
  let rows = 9;
  let mineCount = 10;
  let flags = 0;
  let started = false;
  let over = false;
  let flagMode = false;
  let timer = 0;
  let seconds = 0;

  function index(row, col) { return row * cols + col; }

  function reset() {
    const config = LEVELS[level];
    cols = config.cols;
    rows = config.rows;
    mineCount = config.mines;
    cells = [];
    for (let i = 0; i < rows * cols; i++) {
      cells.push({ mine: false, open: false, flag: false, count: 0 });
    }
    flags = 0;
    started = false;
    over = false;
    seconds = 0;
    clearInterval(timer);
    timer = 0;
    timeEl.textContent = '0';
    status.textContent = 'Click a square to start — the first click is always safe.';
    paintBest();
    render();
  }

  function paintBest() {
    const best = SS.best.get('minesweeper.' + level, 0);
    bestEl.textContent = best ? best + 's' : '—';
  }

  function seed(safeIndex) {
    const safeArea = [safeIndex];
    const row = Math.floor(safeIndex / cols);
    const col = safeIndex % cols;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols) safeArea.push(index(r, c));
      }
    }
    let placed = 0;
    while (placed < mineCount) {
      const target = Math.floor(Math.random() * cells.length);
      if (cells[target].mine || safeArea.indexOf(target) > -1) continue;
      cells[target].mine = true;
      placed++;
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let count = 0;
        neighbours(r, c).forEach(function (n) { if (cells[n].mine) count++; });
        cells[index(r, c)].count = count;
      }
    }
  }

  function neighbours(row, col) {
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols) out.push(index(r, c));
      }
    }
    return out;
  }

  function render() {
    let html = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cells[index(r, c)];
        let content = '';
        let cls = 'ms__cell';
        if (cell.open) {
          cls += ' is-open';
          if (cell.mine) { cls += ' is-mine'; content = '✱'; }
          else if (cell.count) { cls += ' n' + cell.count; content = String(cell.count); }
        } else if (cell.flag) {
          cls += ' is-flag';
          content = '⚑';
        }
        html += '<button class="' + cls + '" type="button" data-index="' + index(r, c) + '" aria-label="Square">' + content + '</button>';
      }
    }
    board.style.setProperty('--cols', String(cols));
    board.innerHTML = html;
    minesEl.textContent = String(Math.max(0, mineCount - flags));
  }

  function tick() {
    seconds++;
    timeEl.textContent = String(seconds);
  }

  function reveal(startIndex) {
    const stack = [startIndex];
    while (stack.length) {
      const i = stack.pop();
      const cell = cells[i];
      if (cell.open || cell.flag) continue;
      cell.open = true;
      if (cell.mine) { lose(i); return; }
      if (cell.count === 0) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        neighbours(row, col).forEach(function (n) { if (!cells[n].open) stack.push(n); });
      }
    }
    checkWin();
  }

  function lose(hit) {
    over = true;
    clearInterval(timer);
    cells.forEach(function (cell) { if (cell.mine) cell.open = true; });
    render();
    board.querySelector('[data-index="' + hit + '"]').classList.add('is-boom');
    status.textContent = 'Boom — that one was a mine. Press New game to try again.';
  }

  function checkWin() {
    const cleared = cells.filter(function (cell) { return cell.open || cell.mine; }).length;
    if (cleared !== cells.length) return;
    over = true;
    clearInterval(timer);
    const best = SS.best.get('minesweeper.' + level, 0);
    if (!best || seconds < best) SS.best.set('minesweeper.' + level, seconds);
    paintBest();
    status.textContent = 'Cleared in ' + seconds + ' seconds — well played.';
    SS.toast('Board cleared!');
  }

  function clickCell(i) {
    if (over) return;
    const cell = cells[i];
    if (flagMode) { toggleFlag(i); return; }
    if (cell.flag) return;
    if (!started) { started = true; seed(i); timer = setInterval(tick, 1000); }
    reveal(i);
    render();
  }

  function toggleFlag(i) {
    const cell = cells[i];
    if (cell.open) return;
    cell.flag = !cell.flag;
    flags += cell.flag ? 1 : -1;
    render();
  }

  board.addEventListener('click', function (event) {
    const button = event.target.closest('[data-index]');
    if (button) clickCell(Number(button.getAttribute('data-index')));
  });
  board.addEventListener('contextmenu', function (event) {
    const button = event.target.closest('[data-index]');
    event.preventDefault();
    if (button && !over) toggleFlag(Number(button.getAttribute('data-index')));
  });

  document.getElementById('new').addEventListener('click', reset);
  document.getElementById('flag-mode').addEventListener('click', function (event) {
    flagMode = !flagMode;
    event.target.textContent = 'Flag mode: ' + (flagMode ? 'on' : 'off');
    event.target.classList.toggle('is-active', flagMode);
  });
  document.getElementById('levels').addEventListener('click', function (event) {
    const button = event.target.closest('[data-level]');
    if (!button) return;
    level = button.getAttribute('data-level');
    document.querySelectorAll('#levels .chip').forEach(function (chip) { chip.classList.toggle('is-active', chip === button); });
    reset();
  });

  reset();
})();
