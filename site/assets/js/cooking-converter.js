/* Cooking converter — volume and weight units swapped through the density of
   the ingredient, so a cup of flour is not treated as a cup of water. */
(function () {
  const el = (id) => document.getElementById(id);

  /* Grams per millilitre, the number that makes the whole tool work. */
  const INGREDIENTS = [
    { name: 'Water', density: 1, note: 'milk, stock and juice are close enough' },
    { name: 'Milk', density: 1.03 },
    { name: 'All-purpose flour', density: 0.53, note: 'spooned and levelled' },
    { name: 'Whole wheat flour', density: 0.55 },
    { name: 'Granulated sugar', density: 0.845 },
    { name: 'Brown sugar', density: 0.72, note: 'packed' },
    { name: 'Powdered sugar', density: 0.56 },
    { name: 'Butter', density: 0.911 },
    { name: 'Honey', density: 1.42 },
    { name: 'Cooking oil', density: 0.92 },
    { name: 'Rice', density: 0.85, note: 'uncooked long grain' },
    { name: 'Rolled oats', density: 0.41 },
    { name: 'Cocoa powder', density: 0.42 },
    { name: 'Salt', density: 1.2, note: 'table salt' },
    { name: 'Peanut butter', density: 1.09 }
  ];

  /* Volume units carry a millilitre size; weight units carry a gram size. */
  const UNITS = [
    { id: 'tsp', label: 'Teaspoons', kind: 'volume', ml: 4.92892 },
    { id: 'tbsp', label: 'Tablespoons', kind: 'volume', ml: 14.7868 },
    { id: 'cup', label: 'Cups', kind: 'volume', ml: 236.588 },
    { id: 'floz', label: 'Fluid ounces', kind: 'volume', ml: 29.5735 },
    { id: 'ml', label: 'Millilitres', kind: 'volume', ml: 1 },
    { id: 'l', label: 'Litres', kind: 'volume', ml: 1000 },
    { id: 'g', label: 'Grams', kind: 'weight', g: 1 },
    { id: 'kg', label: 'Kilograms', kind: 'weight', g: 1000 },
    { id: 'oz', label: 'Ounces', kind: 'weight', g: 28.3495 },
    { id: 'lb', label: 'Pounds', kind: 'weight', g: 453.592 }
  ];

  const unitById = (id) => UNITS.find((unit) => unit.id === id);

  function num(input, fallback) {
    const value = parseFloat(String(input.value).replace(/[^0-9.-]/g, ''));
    return isFinite(value) ? value : (fallback || 0);
  }

  function pretty(value, unitId) {
    if (!isFinite(value)) return '—';
    const rounded = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(2);
    return Number(rounded).toLocaleString('en-US', { maximumFractionDigits: 4 }) + ' ' + labelFor(unitId);
  }

  const SHORT = { tsp: 'tsp', tbsp: 'tbsp', cup: 'cups', floz: 'fl oz', ml: 'ml', l: 'l', g: 'g', kg: 'kg', oz: 'oz', lb: 'lb' };

  function labelFor(unitId) {
    return SHORT[unitId] || unitId;
  }

  /* Amount of `unitId` → grams, using the ingredient's density. */
  function toGrams(amount, unitId, density) {
    const unit = unitById(unitId);
    return unit.kind === 'volume' ? amount * unit.ml * density : amount * unit.g;
  }

  function fromGrams(grams, unitId, density) {
    const unit = unitById(unitId);
    return unit.kind === 'volume' ? grams / (unit.ml * density) : grams / unit.g;
  }

  function ingredient() {
    return INGREDIENTS[Number(el('ingredient').value) || 0];
  }

  function fillSelect(select, selected) {
    select.innerHTML = UNITS.map((unit) => '<option value="' + unit.id + '">' + unit.label + '</option>').join('');
    select.value = selected;
  }

  function update() {
    const item = ingredient();
    const amount = num(el('amount'), 1);
    const from = el('from').value;
    const to = el('to').value;

    const grams = toGrams(amount, from, item.density);
    const value = fromGrams(grams, to, item.density);

    el('result').textContent = pretty(value, to);
    el('sentence').textContent = amount + ' ' + labelFor(from) + ' of ' + item.name.toLowerCase() +
      ' weighs about ' + toGrams(amount, from, item.density).toFixed(1) + ' g and is ' +
      pretty(value, to) + '.';

    const rows = [['1 teaspoon', 'tsp'], ['1 tablespoon', 'tbsp'], ['1 cup', 'cup'], ['100 grams', 'g'], ['1 ounce', 'oz']];
    el('table').innerHTML =
      '<thead><tr><th>Measure of ' + item.name + '</th><th>Grams</th><th>Millilitres</th><th>Ounces</th></tr></thead><tbody>' +
      rows.map(([label, unitId]) => {
        const gramsBase = toGrams(unitId === 'g' ? 100 : 1, unitId, item.density);
        return '<tr><td>' + label + '</td>' +
          '<td class="mono">' + gramsBase.toFixed(1) + '</td>' +
          '<td class="mono">' + fromGrams(gramsBase, 'ml', item.density).toFixed(1) + '</td>' +
          '<td class="mono">' + fromGrams(gramsBase, 'oz', item.density).toFixed(2) + '</td></tr>';
      }).join('') +
      '</tbody>';
  }

  el('ingredient').innerHTML = INGREDIENTS.map((item, index) =>
    '<option value="' + index + '">' + item.name + (item.note ? ' — ' + item.note : '') + '</option>').join('');

  fillSelect(el('from'), 'cup');
  fillSelect(el('to'), 'g');

  el('ingredient').addEventListener('change', update);
  el('amount').addEventListener('input', update);
  el('from').addEventListener('change', update);
  el('to').addEventListener('change', update);

  el('swap').addEventListener('click', () => {
    const from = el('from').value;
    el('from').value = el('to').value;
    el('to').value = from;
    update();
  });

  el('reset').addEventListener('click', () => {
    el('ingredient').value = '0';
    el('amount').value = '1';
    el('from').value = 'cup';
    el('to').value = 'g';
    update();
  });

  el('copy').addEventListener('click', () => SS.copy(el('sentence').textContent));

  update();
})();
