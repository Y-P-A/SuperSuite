/* Date Calculator — differences, shifting and exact ages. */
(function () {
  const DAY = 86400000;

  function iso(date) { return date.toISOString().slice(0, 10); }
  function parse(id) {
    const value = document.getElementById(id).value;
    if (!value) return null;
    const parts = value.split('-').map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }
  function pretty(date) {
    return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  function show(id, text) { document.getElementById(id).textContent = text; }

  const today = new Date();
  const todayIso = iso(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())));
  document.getElementById('b1').value = todayIso;
  document.getElementById('s1').value = todayIso;

  function between() {
    const a = parse('b1');
    const b = parse('b2');
    if (!a || !b) { show('r-between', 'Pick both dates'); return; }
    const days = Math.round((b - a) / DAY);
    const weeks = (days / 7).toFixed(1);
    show('r-between', Math.abs(days) + ' days (' + weeks + ' weeks)');
  }

  function shift() {
    const date = parse('s1');
    const amount = Number(document.getElementById('s2').value) || 0;
    if (!date) { show('r-shift', 'Pick a date'); return; }
    const result = new Date(date.getTime() + amount * DAY);
    show('r-shift', pretty(result));
  }

  function age() {
    const birth = parse('a1');
    if (!birth) { show('r-age', 'Pick a date of birth'); document.getElementById('a-extra').textContent = ''; return; }
    const now = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    if (birth > now) { show('r-age', 'That date is in the future'); document.getElementById('a-extra').textContent = ''; return; }

    let years = now.getUTCFullYear() - birth.getUTCFullYear();
    let months = now.getUTCMonth() - birth.getUTCMonth();
    let days = now.getUTCDate() - birth.getUTCDate();
    if (days < 0) {
      months--;
      days += new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
    }
    if (months < 0) { years--; months += 12; }

    show('r-age', years + ' years, ' + months + ' months, ' + days + ' days');
    const totalDays = Math.round((now - birth) / DAY);
    document.getElementById('a-extra').textContent =
      'That is ' + totalDays.toLocaleString() + ' days, or about ' +
      Math.floor(totalDays / 7).toLocaleString() + ' weeks, since ' + pretty(birth) + '.';
  }

  document.getElementById('tabs').addEventListener('click', function (event) {
    const button = event.target.closest('[data-tab]');
    if (!button) return;
    const tab = button.getAttribute('data-tab');
    document.querySelectorAll('#tabs .chip').forEach(function (chip) {
      chip.classList.toggle('is-active', chip === button);
    });
    document.querySelectorAll('[data-panel]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== tab;
    });
  });

  ['b1', 'b2'].forEach(function (id) { document.getElementById(id).addEventListener('input', between); });
  ['s1', 's2'].forEach(function (id) { document.getElementById(id).addEventListener('input', shift); });
  document.getElementById('a1').addEventListener('input', age);

  between();
  shift();
})();
