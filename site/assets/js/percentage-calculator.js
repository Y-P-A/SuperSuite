/* Percentage Calculator — three independent calculations that each update live. */
(function () {
  function num(id) {
    const value = Number(document.getElementById(id).value);
    return Number.isFinite(value) ? value : NaN;
  }
  function round(value) {
    return Math.round(value * 10000) / 10000;
  }
  function show(id, text, bad) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.style.color = bad ? 'var(--red)' : '';
  }

  function update() {
    const p1 = num('p1');
    const v1 = num('v1');
    show('r1', Number.isFinite(p1) && Number.isFinite(v1)
      ? p1 + '% of ' + v1 + ' = ' + round(v1 * p1 / 100)
      : 'Enter both numbers');

    const p2 = num('p2');
    const v2 = num('v2');
    if (v2 === 0) show('r2', 'Cannot divide by zero', true);
    else show('r2', Number.isFinite(p2) && Number.isFinite(v2)
      ? p2 + ' is ' + round(p2 / v2 * 100) + '% of ' + v2
      : 'Enter both numbers');

    const p3 = num('p3');
    const v3 = num('v3');
    if (p3 === 0) show('r3', 'Starting value cannot be zero', true);
    else if (Number.isFinite(p3) && Number.isFinite(v3)) {
      const change = (v3 - p3) / Math.abs(p3) * 100;
      const word = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change';
      show('r3', round(Math.abs(change)) + '% ' + word + ' (' + p3 + ' → ' + v3 + ')');
    } else show('r3', 'Enter both numbers');
  }

  ['p1', 'v1', 'p2', 'v2', 'p3', 'v3'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', update);
  });

  update();
})();
