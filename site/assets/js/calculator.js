/* Calculator: click or type. Expressions are parsed and evaluated here —
   no eval(), no surprises. */
(function () {
  const exprEl = document.getElementById('expr');
  const valueEl = document.getElementById('value');
  const tapeEl = document.getElementById('tape');
  const tapeEmpty = document.getElementById('tape-empty');
  const keypad = document.getElementById('keypad');

  const DIGITS = '0123456789';
  const OPERATORS = '+-*/';

  let source = '';      // raw expression, e.g. "12+3.5*2"
  let lastResult = '0';

  /* ---------- formatting ---------- */
  function formatNumber(n) {
    if (!isFinite(n)) return 'Error';
    const abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) return n.toExponential(6);
    const rounded = Math.round(n * 1e10) / 1e10;
    return String(rounded);
  }

  function pretty(text) {
    return text.replace(/\*/g, ' \u00d7 ').replace(/\//g, ' \u00f7 ');
  }

  /* ---------- tiny expression parser ---------- */
  function tokenize(src) {
    const tokens = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (DIGITS.indexOf(c) > -1 || c === '.') {
        let num = '';
        while (i < src.length && (DIGITS.indexOf(src[i]) > -1 || src[i] === '.')) num += src[i++];
        if ((num.match(/\./g) || []).length > 1) throw new Error('bad number');
        tokens.push({ type: 'num', value: parseFloat(num) });
        continue;
      }
      if (OPERATORS.indexOf(c) > -1 || c === '%') {
        tokens.push({ type: 'op', value: c });
        i++;
        continue;
      }
      throw new Error('bad character');
    }
    return tokens;
  }

  function evaluate(tokens) {
    let pos = 0;
    const peek = () => tokens[pos];

    function factor() {
      const token = peek();
      if (!token) throw new Error('incomplete');
      if (token.type === 'op' && (token.value === '-' || token.value === '+')) {
        pos++;
        const value = factor();
        return token.value === '-' ? -value : value;
      }
      if (token.type !== 'num') throw new Error('incomplete');
      pos++;
      let value = token.value;
      while (peek() && peek().type === 'op' && peek().value === '%') {
        pos++;
        value = value / 100;
      }
      return value;
    }

    function term() {
      let left = factor();
      while (peek() && peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
        const op = tokens[pos++].value;
        const right = factor();
        if (op === '/') {
          if (right === 0) throw new Error('divide by zero');
          left = left / right;
        } else {
          left = left * right;
        }
      }
      return left;
    }

    function expression() {
      let left = term();
      while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const op = tokens[pos++].value;
        const right = term();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    }

    const value = expression();
    if (pos < tokens.length) throw new Error('incomplete');
    return value;
  }

  function tryEvaluate(src) {
    /* Strip a dangling operator while typing — but keep "%", which is a
       postfix on the number it follows (200*5% is 10, not 1000). */
    const trimmed = src.replace(/[+\-*/.]+$/, '');
    if (!trimmed) return null;
    try {
      return evaluate(tokenize(trimmed));
    } catch (err) {
      return null;
    }
  }

  /* ---------- rendering ---------- */
  function render() {
    exprEl.textContent = source ? pretty(source) : '\u00a0';
    const preview = tryEvaluate(source);
    if (preview === null) {
      valueEl.textContent = source ? lastResult : '0';
    } else {
      valueEl.textContent = formatNumber(preview);
    }
  }

  function addToTape(text) {
    const item = document.createElement('li');
    item.textContent = text;
    item.title = 'Click to copy';
    item.addEventListener('click', () => SS.copy(text));
    tapeEl.prepend(item);
    while (tapeEl.children.length > 30) tapeEl.lastChild.remove();
    tapeEmpty.hidden = true;
  }

  function clearTape() {
    tapeEl.innerHTML = '';
    tapeEmpty.hidden = false;
  }

  document.getElementById('clear-tape').addEventListener('click', clearTape);

  /* ---------- input handling ---------- */
  function currentNumber() {
    const match = source.match(/(\d*\.?\d*)$/);
    return match ? match[1] : '';
  }

  function press(key) {
    if (DIGITS.indexOf(key) > -1) {
      const trailing = currentNumber();
      if (trailing === '0') source = source.slice(0, -1) + key;
      else source += key;
      return;
    }

    switch (key) {
      case '.':
        if (currentNumber().indexOf('.') === -1) source += currentNumber() === '' ? '0.' : '.';
        break;
      case '+':
      case '-':
      case '*':
      case '/':
        if (!source) {
          if (key === '-') source = '-';
          break;
        }
        if (OPERATORS.indexOf(source.slice(-1)) > -1) source = source.slice(0, -1) + key;
        else if (source.slice(-1) !== '.') source += key;
        break;
      case '%':
        if (/\d$/.test(source)) source += '%';
        break;
      case 'negate': {
        const trailing = currentNumber();
        if (!trailing) {
          source += source ? '(-' : '-';
        } else {
          const start = source.length - trailing.length;
          const before = source.slice(0, start);
          if (before.endsWith('-') && (start < 2 || OPERATORS.indexOf(before[before.length - 2]) > -1)) {
            source = before.slice(0, -1) + trailing;
          } else {
            source = before + '-' + trailing;
          }
        }
        break;
      }
      case 'backspace':
        source = source.slice(0, -1);
        break;
      case 'clear':
        source = '';
        lastResult = '0';
        break;
      case 'equals': {
        const value = tryEvaluate(source);
        if (value === null) {
          /* A complete sum that cannot be worked out (like 5/0) says so. */
          if (!/[+\-*/.]+$/.test(source)) lastResult = 'Error';
          break;
        }
        const result = formatNumber(value);
        addToTape(pretty(source.replace(/[+\-*/.]+$/, '')) + ' = ' + result);
        lastResult = result;
        source = result;
        break;
      }
      default:
        return;
    }
    render();
  }

  keypad.addEventListener('click', (event) => {
    const button = event.target.closest('[data-key]');
    if (button) press(button.getAttribute('data-key'));
  });

  const KEY_MAP = {
    Enter: 'equals',
    '=': 'equals',
    Backspace: 'backspace',
    Delete: 'clear',
    Escape: 'clear',
    c: 'clear',
    '×': '*',
    '÷': '/'
  };

  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey) return;
    const key = event.key;
    let action = null;
    if (DIGITS.indexOf(key) > -1 || key === '.' || OPERATORS.indexOf(key) > -1 || key === '%') action = key;
    else if (KEY_MAP[key]) action = KEY_MAP[key];
    else if (KEY_MAP[key.toLowerCase()]) action = KEY_MAP[key.toLowerCase()];
    if (!action) return;
    event.preventDefault();
    render();
    press(action);
  });

  render();
})();
