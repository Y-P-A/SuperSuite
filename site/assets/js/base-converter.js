/* Base Converter — parse once, print every common base. */
(function () {
  const input = document.getElementById('input');
  const from = document.getElementById('from');
  const status = document.getElementById('status');

  const LABELS = {
    2: 'Binary', 3: 'Base 3', 4: 'Base 4', 5: 'Base 5', 6: 'Base 6', 7: 'Base 7',
    8: 'Octal', 9: 'Base 9', 10: 'Decimal', 11: 'Base 11', 12: 'Base 12',
    16: 'Hexadecimal', 32: 'Base 32', 36: 'Base 36'
  };

  from.innerHTML = Object.keys(LABELS).map(function (base) {
    return '<option value="' + base + '"' + (base === '10' ? ' selected' : '') + '>' + base + ' — ' + LABELS[base] + '</option>';
  }).join('');

  function render() {
    const base = Number(from.value);
    const raw = input.value.trim().toLowerCase();
    const valid = raw === '' || /^[0-9a-z]+$/.test(raw);
    const value = valid && raw ? parseInt(raw, base) : NaN;

    if (!raw) {
      ['bin', 'oct', 'dec', 'hex', 'b36'].forEach(function (id) { document.getElementById(id).textContent = ''; });
      status.textContent = 'Type a value to convert.';
      status.className = 'note';
      return;
    }
    if (!Number.isFinite(value)) {
      status.textContent = '“' + raw + '” is not a valid base-' + base + ' number.';
      status.className = 'warn';
      return;
    }

    document.getElementById('bin').textContent = value.toString(2);
    document.getElementById('oct').textContent = value.toString(8);
    document.getElementById('dec').textContent = value.toString(10);
    document.getElementById('hex').textContent = value.toString(16).toUpperCase();
    document.getElementById('b36').textContent = value.toString(36).toUpperCase();
    status.textContent = 'Parsed “' + raw + '” as base ' + base + '.';
    status.className = 'note';
  }

  input.addEventListener('input', render);
  from.addEventListener('change', render);
  render();
})();
