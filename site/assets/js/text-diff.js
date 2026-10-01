/* Text Diff — a line-by-line comparison using a classic LCS walk. */
(function () {
  const a = document.getElementById('a');
  const b = document.getElementById('b');
  const result = document.getElementById('result');

  function lines(value) { return value.replace(/\r\n/g, '\n').split('\n'); }

  /* Longest common subsequence table, capped so a huge paste cannot lock up. */
  function lcs(x, y) {
    const n = x.length;
    const m = y.length;
    const table = [];
    for (let i = 0; i <= n; i++) table.push(new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        table[i][j] = x[i] === y[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }
    return table;
  }

  function compare() {
    const x = lines(a.value);
    const y = lines(b.value);

    if (x.join('\n').length + y.join('\n').length > 200000) {
      result.innerHTML = '<p class="warn">That is a lot of text — trim it a little and try again.</p>';
      return;
    }

    const table = lcs(x, y);
    const rows = [];
    let added = 0;
    let removed = 0;
    let same = 0;
    let i = 0;
    let j = 0;

    while (i < x.length && j < y.length) {
      if (x[i] === y[j]) { rows.push(['same', x[i]]); same++; i++; j++; }
      else if (table[i + 1][j] >= table[i][j + 1]) { rows.push(['del', x[i]]); removed++; i++; }
      else { rows.push(['add', y[j]]); added++; j++; }
    }
    while (i < x.length) { rows.push(['del', x[i]]); removed++; i++; }
    while (j < y.length) { rows.push(['add', y[j]]); added++; j++; }

    document.getElementById('added').textContent = String(added);
    document.getElementById('removed').textContent = String(removed);
    document.getElementById('same').textContent = String(same);

    result.innerHTML = rows.map(function (row) {
      const sign = row[0] === 'add' ? '+' : row[0] === 'del' ? '−' : ' ';
      const text = row[1].replace(/[&<>]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
      });
      return '<div class="diff__line diff__line--' + row[0] + '"><span class="diff__sign">' + sign +
        '</span><span>' + (text || '&nbsp;') + '</span></div>';
    }).join('') || '<p class="muted small">Both sides are empty.</p>';
  }

  const SAMPLE_A = 'SuperSuite 1.0\nTen utilities\nFive games\nStatic site, no backend';
  const SAMPLE_B = 'SuperSuite — Alpha 1.0\nThirty utilities\nFifteen games\nStatic site, no backend\nRewind themes';

  document.getElementById('compare').addEventListener('click', compare);
  document.getElementById('swap').addEventListener('click', function () {
    const tmp = a.value; a.value = b.value; b.value = tmp; compare();
  });
  document.getElementById('clear').addEventListener('click', function () {
    a.value = ''; b.value = ''; compare();
  });
  document.getElementById('sample').addEventListener('click', function () {
    a.value = SAMPLE_A; b.value = SAMPLE_B; compare();
  });

  [a, b].forEach(function (el) { el.addEventListener('input', compare); });

  a.value = SAMPLE_A;
  b.value = SAMPLE_B;
  compare();
})();
