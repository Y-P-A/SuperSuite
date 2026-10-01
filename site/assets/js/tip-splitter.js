/* Tip Splitter — tip, total and a fair per-person share. */
(function () {
  const bill = document.getElementById('bill');
  const people = document.getElementById('people');
  const custom = document.getElementById('custom');
  const roundUp = document.getElementById('round');
  const tips = document.getElementById('tips');

  function money(value) {
    return value.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function render() {
    const amount = Math.max(0, Number(bill.value) || 0);
    const count = Math.max(1, Math.min(50, Math.floor(Number(people.value) || 1)));
    const percent = Math.max(0, Number(custom.value) || 0);

    const tip = amount * percent / 100;
    const total = amount + tip;
    let each = total / count;
    if (roundUp.checked) each = Math.ceil(each * 100) / 100;

    document.getElementById('o-tip').textContent = money(tip);
    document.getElementById('o-total').textContent = money(total);
    document.getElementById('o-each').textContent = money(each);

    const collected = each * count;
    document.getElementById('o-detail').textContent =
      'Bill ' + money(amount) + ' + ' + percent + '% tip = ' + money(total) + '.\n' +
      'Split ' + count + ' ways: ' + money(each) + ' each' +
      (roundUp.checked ? ' (rounded up, ' + money(collected) + ' collected)' : '') + '.';
  }

  tips.addEventListener('click', function (event) {
    const button = event.target.closest('[data-tip]');
    if (!button) return;
    custom.value = button.getAttribute('data-tip');
    tips.querySelectorAll('.chip').forEach(function (chip) { chip.classList.toggle('is-active', chip === button); });
    render();
  });

  [bill, people, custom].forEach(function (el) { el.addEventListener('input', render); });
  roundUp.addEventListener('change', render);

  render();
})();
