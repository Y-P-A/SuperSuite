/* Snake — 20x20 grid, queued turns so fast fingers do not lose moves. */
(function () {
  const CELLS = 20;
  const CELL = 24;
  const W = CELLS * CELL;
  const H = CELLS * CELL;

  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const lengthEl = document.getElementById('length');
  const speedEl = document.getElementById('speed');
  const bestEl = document.getElementById('best');
  const pauseBtn = document.getElementById('pause');

  const keys = SS.createKeys();
  SS.bindPad(keys);
  const overlay = SS.createOverlay('overlay');

  let snake = [];
  let direction = { x: 1, y: 0 };
  let queue = [];
  let food = { x: 0, y: 0 };
  let score = 0;
  let state = 'ready'; // ready | playing | paused | over
  let moveTimer = 0;

  function stepInterval() {
    return Math.max(72, 140 - Math.floor(score / 10) * 4);
  }

  function placeFood() {
    const free = [];
    for (let y = 0; y < CELLS; y++) {
      for (let x = 0; x < CELLS; x++) {
        if (!snake.some((part) => part.x === x && part.y === y)) free.push({ x: x, y: y });
      }
    }
    food = free[Math.floor(Math.random() * free.length)] || { x: 0, y: 0 };
  }

  function startGame() {
    snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    direction = { x: 1, y: 0 };
    queue = [];
    score = 0;
    moveTimer = 0;
    placeFood();
    state = 'playing';
    overlay.hide();
    pauseBtn.textContent = 'Pause';
    refreshHud();
  }

  function refreshHud() {
    scoreEl.textContent = String(score);
    lengthEl.textContent = String(snake.length);
    speedEl.textContent = String(1 + Math.floor(score / 50));
    bestEl.textContent = String(Math.max(SS.best.get('snake', 0), score));
  }

  function finish() {
    state = 'over';
    keys.clear();
    const best = SS.best.get('snake', 0);
    if (score > best) SS.best.set('snake', score);
    overlay.show('Game over',
      'You scored ' + score + ' with a length of ' + snake.length + '. Best: ' + Math.max(best, score) + '.',
      'Try again', startGame);
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
  document.getElementById('restart').addEventListener('click', startGame);
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    event.stopPropagation();
    if (state === 'ready' || state === 'over') startGame();
    else if (state === 'paused') togglePause();
  });

  function queueTurn(x, y) {
    const last = queue.length ? queue[queue.length - 1] : direction;
    if (last.x === -x && last.y === -y) return; // no reversing
    if (last.x === x && last.y === y) return;
    queue.push({ x: x, y: y });
  }

  function collectInput() {
    if (keys.pressed('ArrowLeft') || keys.pressed('KeyA')) queueTurn(-1, 0);
    if (keys.pressed('ArrowRight') || keys.pressed('KeyD')) queueTurn(1, 0);
    if (keys.pressed('ArrowUp') || keys.pressed('KeyW')) queueTurn(0, -1);
    if (keys.pressed('ArrowDown') || keys.pressed('KeyS')) queueTurn(0, 1);
  }

  function move() {
    if (queue.length) direction = queue.shift();
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= CELLS || head.y < 0 || head.y >= CELLS) {
      finish();
      return;
    }
    if (snake.some((part) => part.x === head.x && part.y === head.y)) {
      finish();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      placeFood();
    } else {
      snake.pop();
    }
    refreshHud();
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < CELLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL + 0.5, 0);
      ctx.lineTo(i * CELL + 0.5, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL + 0.5);
      ctx.lineTo(W, i * CELL + 0.5);
      ctx.stroke();
    }

    ctx.fillStyle = '#e67e22';
    ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);

    snake.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? '#f1c40f' : (index % 2 ? '#27ae60' : '#16a085');
      ctx.fillRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }

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
      startGame();
      return;
    }

    if (state === 'playing') {
      collectInput();
      moveTimer += dt;
      if (moveTimer >= stepInterval()) {
        moveTimer = 0;
        move();
      }
    }
    keys.endFrame();
    draw();
  });

  refreshHud();
  draw();
  loop.start();
})();
