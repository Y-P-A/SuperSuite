/* Data size converter — decimal against binary units, plus an honest download
   time from a megabit connection. */
(function () {
  const el = (id) => document.getElementById(id);

  const DECIMAL = [
    { id: 'bit', label: 'Bits', bytes: 1 / 8 },
    { id: 'byte', label: 'Bytes', bytes: 1 },
    { id: 'kb', label: 'Kilobytes (KB)', bytes: 1e3 },
    { id: 'mb', label: 'Megabytes (MB)', bytes: 1e6 },
    { id: 'gb', label: 'Gigabytes (GB)', bytes: 1e9 },
    { id: 'tb', label: 'Terabytes (TB)', bytes: 1e12 },
    { id: 'pb', label: 'Petabytes (PB)', bytes: 1e15 }
  ];

  const BINARY = [
    { id: 'bit', label: 'Bits', bytes: 1 / 8 },
    { id: 'byte', label: 'Bytes', bytes: 1 },
    { id: 'kib', label: 'Kibibytes (KiB)', bytes: 1024 },
    { id: 'mib', label: 'Mebibytes (MiB)', bytes: 1024 ** 2 },
    { id: 'gib', label: 'Gibibytes (GiB)', bytes: 1024 ** 3 },
    { id: 'tib', label: 'Tebibytes (TiB)', bytes: 1024 ** 4 },
    { id: 'pib', label: 'Pebibytes (PiB)', bytes: 1024 ** 5 }
  ];

  const ALL = DECIMAL.concat(BINARY.filter((unit) => !DECIMAL.some((other) => other.id === unit.id)));
  const byId = (id) => ALL.find((unit) => unit.id === id) || ALL[0];

  let mode = 'decimal';

  function units() {
    return mode === 'decimal' ? DECIMAL : BINARY;
  }

  function num(input, fallback) {
    const value = parseFloat(String(input.value).replace(/[^0-9.eE+-]/g, ''));
    return isFinite(value) ? value : (fallback || 0);
  }

  function pretty(value) {
    if (!isFinite(value) || value === 0) return '0';
    const abs = Math.abs(value);
    if (abs >= 1e15 || abs < 1e-4) return value.toExponential(3);
    const digits = abs >= 100 ? 2 : abs >= 1 ? 3 : 5;
    return Number(value.toPrecision(digits + 1)).toLocaleString('en-US', { maximumFractionDigits: 6 });
  }

  function duration(seconds) {
    if (!isFinite(seconds) || seconds <= 0) return 'instant';
    if (seconds < 1) return (seconds * 1000).toFixed(0) + ' ms';
    if (seconds < 60) return seconds.toFixed(1) + ' s';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ' + Math.round(seconds % 60) + ' s';
    return (seconds / 3600).toFixed(1) + ' h';
  }

  /* Switching between decimal and binary keeps the same size bracket (MB → MiB)
     instead of dropping the user back to a default unit. */
  const EQUIVALENT = {
    bit: 'bit', byte: 'byte',
    kb: 'kib', mb: 'mib', gb: 'gib', tb: 'tib', pb: 'pib',
    kib: 'kb', mib: 'mb', gib: 'gb', tib: 'tb', pib: 'pb'
  };

  function fillSelect(select, selected) {
    const list = units();
    const wanted = list.some((unit) => unit.id === selected)
      ? selected
      : (mode === 'decimal' ? 'mb' : 'mib');
    select.innerHTML = list.map((unit) => '<option value="' + unit.id + '">' + unit.label + '</option>').join('');
    select.value = wanted;
  }

  function update() {
    const amount = num(el('amount'), 0);
    const from = byId(el('from').value);
    const to = byId(el('to').value);
    const bytes = amount * from.bytes;
    const result = bytes / to.bytes;

    el('result').textContent = pretty(result) + ' ' + shortLabel(to.id);
    el('exact').textContent = pretty(bytes) + ' bytes';

    const mbps = num(el('speed'), 0);
    el('time').textContent = mbps > 0 ? duration(bytes * 8 / (mbps * 1e6)) + ' at ' + mbps + ' Mbps' : 'add a speed';

    el('table').innerHTML =
      '<thead><tr><th>Unit</th><th>Value</th></tr></thead><tbody>' +
      ALL.map((unit) => '<tr><td>' + unit.label + '</td><td class="mono">' + pretty(bytes / unit.bytes) + '</td></tr>').join('') +
      '</tbody>';
  }

  function shortLabel(id) {
    return { bit: 'bits', byte: 'bytes', kb: 'KB', mb: 'MB', gb: 'GB', tb: 'TB', pb: 'PB', kib: 'KiB', mib: 'MiB', gib: 'GiB', tib: 'TiB', pib: 'PiB' }[id] || id;
  }

  el('modes').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-mode]');
    if (!chip) return;
    mode = chip.getAttribute('data-mode');
    el('modes').querySelectorAll('[data-mode]').forEach((button) => {
      button.classList.toggle('is-active', button === chip);
    });
    fillSelect(el('from'), EQUIVALENT[el('from').value]);
    fillSelect(el('to'), EQUIVALENT[el('to').value]);
    update();
  });

  ['amount', 'speed'].forEach((id) => el(id).addEventListener('input', update));
  ['from', 'to'].forEach((id) => el(id).addEventListener('change', update));

  el('reset').addEventListener('click', () => {
    mode = 'decimal';
    el('modes').querySelectorAll('[data-mode]').forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute('data-mode') === 'decimal');
    });
    el('amount').value = '1500';
    el('speed').value = '100';
    fillSelect(el('from'), 'mb');
    fillSelect(el('to'), 'gb');
    update();
  });

  el('copy').addEventListener('click', () => {
    SS.copy(num(el('amount'), 0) + ' ' + shortLabel(el('from').value) + ' = ' + el('result').textContent);
  });

  fillSelect(el('from'), 'mb');
  fillSelect(el('to'), 'gb');
  update();
})();
