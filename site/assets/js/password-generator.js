/* Password generator: crypto.getRandomValues, uniform picks, one character
   from every enabled set so the result is never missing a category. */
(function () {
  const SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}<>?,.:;/'
  };
  const AMBIGUOUS = /[O0oIl1|]/g;

  const lengthEl = document.getElementById('length');
  const lengthVal = document.getElementById('length-val');
  const outEl = document.getElementById('out');
  const meterEl = document.getElementById('meter');
  const strengthEl = document.getElementById('strength');
  const errorEl = document.getElementById('error');
  const plainEl = document.getElementById('plain');

  function enabled() {
    return ['lower', 'upper', 'digits', 'symbols'].filter(function (name) {
      return document.getElementById(name).checked;
    });
  }

  function pool() {
    let chars = enabled().map(function (name) { return SETS[name]; }).join('');
    if (plainEl.checked) chars = chars.replace(AMBIGUOUS, '');
    return Array.from(new Set(chars)).join('');
  }

  /* Uniform pick: values above the last full block are thrown away. */
  function randomIndex(max) {
    const limit = Math.floor(4294967296 / max) * max;
    const buffer = new Uint32Array(1);
    let value;
    do {
      crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);
    return value % max;
  }

  function pick(chars) {
    return chars.charAt(randomIndex(chars.length));
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      const held = list[i];
      list[i] = list[j];
      list[j] = held;
    }
    return list;
  }

  function strengthFor(entropy) {
    if (entropy < 40) return { label: 'Weak — add length or more character types', color: 'var(--red)', width: 25 };
    if (entropy < 60) return { label: 'Okay — fine for throwaway logins', color: 'var(--orange)', width: 50 };
    if (entropy < 80) return { label: 'Strong', color: 'var(--green)', width: 75 };
    if (entropy < 110) return { label: 'Very strong', color: 'var(--teal)', width: 92 };
    return { label: 'Overkill — perfect for password managers', color: 'var(--blue)', width: 100 };
  }

  function generate() {
    const picked = pool();
    const length = Number(lengthEl.value);
    const needs = enabled().map(function (name) {
      let chars = SETS[name];
      if (plainEl.checked) chars = chars.replace(AMBIGUOUS, '');
      return chars;
    }).filter(function (chars) { return chars.length; });

    if (!picked.length || !needs.length) {
      errorEl.hidden = false;
      errorEl.textContent = 'Pick at least one kind of character.';
      outEl.textContent = '—';
      meterEl.style.width = '0';
      strengthEl.textContent = '—';
      return;
    }

    errorEl.hidden = true;

    const characters = needs.map(function (chars) { return pick(chars); });
    while (characters.length < length) characters.push(pick(picked));
    const password = shuffle(characters.slice(0, Math.max(length, needs.length))).join('');

    outEl.textContent = password;

    const entropy = password.length * Math.log2(Array.from(new Set(picked)).length);
    const strength = strengthFor(entropy);
    meterEl.style.width = strength.width + '%';
    meterEl.style.background = strength.color;
    strengthEl.textContent = strength.label + ' · about ' + Math.round(entropy) + ' bits of entropy';
    document.title = 'Password Generator — SuperSuite';
  }

  lengthEl.addEventListener('input', function () {
    lengthVal.textContent = lengthEl.value;
  });

  ['lower', 'upper', 'digits', 'symbols', 'plain'].forEach(function (name) {
    document.getElementById(name).addEventListener('change', generate);
  });

  document.getElementById('generate').addEventListener('click', generate);
  document.getElementById('copy').addEventListener('click', function () {
    const password = outEl.textContent;
    if (!password || password === '—') {
      SS.toast('Generate a password first');
      return;
    }
    SS.copy(password);
  });

  generate();
})();
