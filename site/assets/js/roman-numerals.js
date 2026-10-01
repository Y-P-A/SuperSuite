/* Roman Numerals — standard 1–3999 conversion both ways. */
(function () {
  const number = document.getElementById('number');
  const roman = document.getElementById('roman');
  const status = document.getElementById('status');

  const TABLE = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];

  function toRoman(value) {
    if (!Number.isInteger(value) || value < 1 || value > 3999) return null;
    let left = value;
    let out = '';
    TABLE.forEach(function (pair) {
      while (left >= pair[0]) { out += pair[1]; left -= pair[0]; }
    });
    return out;
  }

  function fromRoman(value) {
    const text = String(value).toUpperCase().trim();
    if (!/^[MDCLXVI]+$/.test(text)) return null;
    let total = 0;
    for (let i = 0; i < text.length; i++) {
      const current = value0(text[i]);
      const next = value0(text[i + 1]);
      total += current < next ? -current : current;
    }
    return total > 0 && total <= 3999 ? total : null;
  }
  function value0(char) {
    return { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }[char] || 0;
  }

  function note(message, bad) {
    status.textContent = message;
    status.className = bad ? 'warn' : 'note';
  }

  function fromNumber() {
    const value = Number(number.value);
    const out = toRoman(value);
    if (out) { roman.value = out; note('MMXXVI = 2026 is the year to beat.', false); }
    else note('Enter a whole number between 1 and 3999.', true);
  }

  function fromRomanValue() {
    const value = fromRoman(roman.value);
    if (value) { number.value = String(value); note('Nice — that is a valid Roman numeral.', false); }
    else note('That is not a Roman numeral between 1 and 3999.', true);
  }

  number.addEventListener('input', fromNumber);
  roman.addEventListener('input', fromRomanValue);
  document.getElementById('copy').addEventListener('click', function () {
    if (roman.value) SS.copy(roman.value);
  });
  document.getElementById('today').addEventListener('click', function () {
    number.value = String(new Date().getFullYear());
    fromNumber();
  });

  const samples = [4, 9, 14, 40, 90, 400, 1984, 2026, 3999];
  document.getElementById('table').innerHTML = samples.map(function (n) {
    return '<button class="chip" type="button" data-n="' + n + '">' + n + ' = ' + toRoman(n) + '</button>';
  }).join('');
  document.getElementById('table').addEventListener('click', function (event) {
    const button = event.target.closest('[data-n]');
    if (!button) return;
    number.value = button.getAttribute('data-n');
    fromNumber();
  });

  const year = String(new Date().getFullYear());
  number.value = year;
  roman.value = toRoman(Number(year));
})();
