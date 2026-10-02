/* Discount calculator — sale price, savings, tax and the final total, worked
   out live from the four numbers above it. */
(function () {
  const el = (id) => document.getElementById(id);
  const fields = ['price', 'discount', 'tax', 'extra', 'currency'].map(el);

  function num(input) {
    const value = parseFloat(String(input.value).replace(/[^0-9.-]/g, ''));
    return isFinite(value) ? value : 0;
  }

  function money(value) {
    return (el('currency').value || '') + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(value) * (value < 0 ? -1 : 1));
  }

  function update() {
    const price = num(el('price'));
    const percent = Math.min(Math.max(num(el('discount')), 0), 100);
    const taxRate = Math.max(num(el('tax')), 0);
    const extra = num(el('extra'));

    const saved = price * percent / 100;
    const sale = price - saved;
    const tax = sale * taxRate / 100;
    const total = sale + tax + extra;
    const effective = price > 0 ? (price + extra - sale - extra + saved) / price * 100 : 0;

    el('saved').textContent = money(saved);
    el('sale').textContent = money(sale);
    el('taxout').textContent = money(tax);
    el('total').textContent = money(total);

    const parts = [];
    parts.push(money(price) + ' less ' + percent + '% is ' + money(sale));
    if (saved > 0) parts.push('you save ' + money(saved));
    if (tax > 0) parts.push('plus ' + money(tax) + ' tax');
    if (extra !== 0) parts.push((extra > 0 ? 'plus ' : 'less ') + money(extra) + ' extra');
    parts.push('total ' + money(total));
    el('sentence').textContent = parts.join(' · ') + '.';

    el('sentence').dataset.summary =
      'Original ' + money(price) + '\n' +
      'Discount ' + percent.toFixed(percent % 1 ? 1 : 0) + '% (−' + money(saved) + ')\n' +
      'Sale price ' + money(sale) + '\n' +
      'Tax ' + taxRate + '% (+' + money(tax) + ')\n' +
      (extra !== 0 ? 'Extra charges ' + money(extra) + '\n' : '') +
      'Final total ' + money(total);

    void effective;
  }

  el('copy').addEventListener('click', () => SS.copy(el('sentence').dataset.summary || ''));
  el('reset').addEventListener('click', () => {
    el('price').value = '120';
    el('discount').value = '25';
    el('tax').value = '0';
    el('extra').value = '0';
    el('currency').value = '$';
    update();
  });

  fields.forEach((input) => input.addEventListener('input', update));
  update();
})();
