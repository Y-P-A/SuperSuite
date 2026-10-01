/* Memory Match — flip pairs against the clock. */
(function () {
  const SYMBOLS = ['★', '●', '■', '▲', '◆', '✚', '✖', '❤', '☀', '☂', '♠', '♣', '♦', '♪', '⚑', '✦', '◐', '⬢'];
  const board = document.getElementById('board');
  const movesEl = document.getElementById('moves');
  const pairsEl = document.getElementById('pairs');
  const timeEl = document.getElementById('time');
  const bestEl = document.getElementById('best');

  let size = 4;
  let cards = [];
  let flipped = [];
  let moves = 0;
  let found = 0;
  let locked = false;
  let started = 0;
  let timer = 0;

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  function format(ms) {
    const seconds = Math.floor(ms / 1000);
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  }

  function bestKey() { return 'memory' + size; }

  function showBest() {
    const best = SS.best.get(bestKey(), 0);
    bestEl.textContent = best ? best + ' moves' : '—';
  }

  function start() {
    const total = size * size;
    const picks = SYMBOLS.slice(0, total / 2);
    cards = shuffle(picks.concat(picks)).map(function (symbol) {
      return { symbol: symbol, matched: false, open: false };
    });
    flipped = [];
    moves = 0;
    found = 0;
    locked = false;
    started = 0;
    clearInterval(timer);
    timer = 0;
    timeEl.textContent = '0:00';
    movesEl.textContent = '0';
    pairsEl.textContent = '0 / ' + (total / 2);
    board.style.setProperty('--cols', String(size));
    render();
    showBest();
  }

  function render() {
    board.innerHTML = cards.map(function (card, index) {
      const open = card.open || card.matched;
      return '<button class="mem__card' + (open ? ' is-open' : '') + (card.matched ? ' is-matched' : '') +
        '" type="button" data-index="' + index + '" aria-label="Card ' + (index + 1) + '">' +
        '<span class="mem__face">' + (open ? card.symbol : '?') + '</span>' +
        '</button>';
    }).join('');
  }

  function tick() {
    if (!started) return;
    timeEl.textContent = format(Date.now() - started);
  }

  function flip(index) {
    const card = cards[index];
    if (locked || card.open || card.matched) return;
    if (!started) { started = Date.now(); timer = setInterval(tick, 250); }
    card.open = true;
    flipped.push(index);
    render();

    if (flipped.length < 2) return;
    moves++;
    movesEl.textContent = String(moves);

    const a = cards[flipped[0]];
    const b = cards[flipped[1]];
    if (a.symbol === b.symbol) {
      a.matched = true;
      b.matched = true;
      flipped = [];
      found++;
      pairsEl.textContent = found + ' / ' + (cards.length / 2);
      render();
      if (found === cards.length / 2) win();
    } else {
      locked = true;
      const pair = flipped.slice();
      flipped = [];
      setTimeout(function () {
        pair.forEach(function (i) { cards[i].open = false; });
        locked = false;
        render();
      }, 700);
    }
  }

  function win() {
    clearInterval(timer);
    const best = SS.best.get(bestKey(), 0);
    if (!best || moves < best) SS.best.set(bestKey(), moves);
    showBest();
    SS.toast('Cleared in ' + moves + ' moves');
  }

  board.addEventListener('click', function (event) {
    const button = event.target.closest('[data-index]');
    if (button) flip(Number(button.getAttribute('data-index')));
  });

  document.getElementById('new').addEventListener('click', start);
  document.getElementById('sizes').addEventListener('click', function (event) {
    const button = event.target.closest('[data-size]');
    if (!button) return;
    size = Number(button.getAttribute('data-size'));
    document.querySelectorAll('#sizes .chip').forEach(function (chip) {
      chip.classList.toggle('is-active', chip === button);
    });
    start();
  });

  start();
})();
