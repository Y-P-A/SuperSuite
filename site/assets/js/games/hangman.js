/* Hangman — one word, six mistakes. Words carry a hint so a wrong guess never
   feels like a shot in the dark. Streaks are remembered. */
(function () {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const wordEl = document.getElementById('word');
  const keysEl = document.getElementById('keys');
  const hintEl = document.getElementById('hint');
  const wrongEl = document.getElementById('wrong');
  const streakEl = document.getElementById('streak');
  const bestEl = document.getElementById('best');
  const overlay = SS.createOverlay('overlay');

  const WORDS = [
    ['BROWSER', 'Where this page is running'],
    ['KEYBOARD', 'You are probably using one'],
    ['PLANET', 'One of eight going round the sun'],
    ['VOLCANO', 'Mountain that lets off steam'],
    ['PENGUIN', 'Bird that swims but cannot fly'],
    ['GUITAR', 'Six strings and a fretboard'],
    ['COMPASS', 'Always points north'],
    ['LIBRARY', 'Borrow books here'],
    ['RAINBOW', 'Seven colours after the rain'],
    ['BICYCLE', 'Two wheels and a chain'],
    ['ELEPHANT', 'Largest land animal'],
    ['TELESCOPE', 'Bring the stars closer'],
    ['CHOCOLATE', 'Made from cocoa beans'],
    ['ASTRONAUT', 'Works above the atmosphere'],
    ['SANDWICH', 'Lunch between two slices'],
    ['PYRAMID', 'Ancient Egyptian tomb'],
    ['DOLPHIN', 'Clever ocean mammal'],
    ['UMBRELLA', 'Comes out when it rains'],
    ['TORNADO', 'Spinning column of air'],
    ['CACTUS', 'Spiky desert plant'],
    ['MAGNET', 'Pulls iron towards it'],
    ['PIRATE', 'Sails under a black flag'],
    ['ROCKET', 'Leaves the ground very fast'],
    ['ISLAND', 'Land with water all around'],
    ['LANTERN', 'A light you can carry'],
    ['PUZZLE', 'Pieces that fit together'],
    ['GALAXY', 'Billions of stars together'],
    ['HARVEST', 'Gathering the crops'],
    ['MONKEY', 'Swings through the trees'],
    ['VIOLIN', 'Played with a bow'],
    ['CANDLE', 'Wax with a wick'],
    ['THUNDER', 'Comes after the lightning']
  ];

  let word = '';
  let hint = '';
  let guessed = new Set();
  let wrong = 0;
  let streak = 0;
  let state = 'ready'; // ready | playing | over

  keysEl.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    .map((letter) => '<button class="chip" type="button" data-letter="' + letter + '">' + letter + '</button>')
    .join('');

  function refresh() {
    wordEl.textContent = word.split('').map((letter) => (guessed.has(letter) ? letter : '_')).join(' ');
    wrongEl.textContent = wrong + ' / 6';
    streakEl.textContent = String(streak);
    bestEl.textContent = String(SS.best.get('hangman', 0));
    hintEl.textContent = hint ? 'Hint: ' + hint : '—';
    keysEl.querySelectorAll('[data-letter]').forEach((button) => {
      const letter = button.getAttribute('data-letter');
      const used = guessed.has(letter);
      button.classList.toggle('is-active', used);
      button.disabled = used || state !== 'playing';
    });
  }

  function pickWord() {
    let next = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (WORDS.length > 1) {
      while (next[0] === word) next = WORDS[Math.floor(Math.random() * WORDS.length)];
    }
    word = next[0];
    hint = next[1];
  }

  function startGame() {
    pickWord();
    guessed = new Set();
    wrong = 0;
    state = 'playing';
    overlay.hide();
    refresh();
  }

  function solved() {
    return word.split('').every((letter) => guessed.has(letter));
  }

  function guess(letter) {
    if (state !== 'playing' || guessed.has(letter)) return;
    guessed.add(letter);

    if (word.indexOf(letter) === -1) wrong += 1;

    if (solved()) {
      state = 'over';
      streak += 1;
      if (streak > SS.best.get('hangman', 0)) SS.best.set('hangman', streak);
      refresh();
      overlay.show('Got it!', 'The word was ' + word + '. Streak: ' + streak + '.', 'Next word', startGame);
      return;
    }

    if (wrong >= 6) {
      state = 'over';
      streak = 0;
      refresh();
      overlay.show('Out of lives', 'The word was ' + word + '. The streak resets.', 'Try another', startGame);
      return;
    }

    refresh();
  }

  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function draw() {
    ctx.fillStyle = '#0f1626';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#7d8aa0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    line(24, 214, 150, 214);   /* ground */
    line(58, 214, 58, 28);     /* pole */
    line(56, 30, 162, 30);     /* beam */
    line(160, 30, 160, 50);    /* rope */

    ctx.strokeStyle = '#f5c451';
    ctx.lineWidth = 5;

    if (wrong >= 1) {
      ctx.beginPath();
      ctx.arc(160, 68, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (wrong >= 2) line(160, 86, 160, 140);
    if (wrong >= 3) line(160, 100, 134, 120);
    if (wrong >= 4) line(160, 100, 186, 120);
    if (wrong >= 5) line(160, 140, 137, 172);
    if (wrong >= 6) line(160, 140, 183, 172);
  }

  keysEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-letter]');
    if (button) guess(button.getAttribute('data-letter'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (!/^Key[A-Z]$/.test(event.code)) return;
    const target = event.target;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    event.preventDefault();
    guess(event.code.slice(3));
  });

  document.getElementById('restart').addEventListener('click', startGame);
  document.querySelector('[data-overlay-button]').addEventListener('click', (event) => {
    event.stopPropagation();
    startGame();
  });

  const loop = SS.createLoop(() => {
    keys.endFrame();
    draw();
  });

  pickWord();
  refresh();
  draw();
  loop.start();
})();
