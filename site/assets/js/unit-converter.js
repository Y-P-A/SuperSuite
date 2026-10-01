/* Unit converter: one factor table per category, plus the three temperature
   scales which convert with formulas instead of factors. */
(function () {
  /* [id, label, symbol, factor-to-base] */
  const CATEGORIES = [
    {
      id: 'length',
      label: 'Length',
      defaults: ['m', 'ft'],
      units: [
        ['mm', 'Millimeter', 'mm', 0.001],
        ['cm', 'Centimeter', 'cm', 0.01],
        ['m', 'Meter', 'm', 1],
        ['km', 'Kilometer', 'km', 1000],
        ['in', 'Inch', 'in', 0.0254],
        ['ft', 'Foot', 'ft', 0.3048],
        ['yd', 'Yard', 'yd', 0.9144],
        ['mi', 'Mile', 'mi', 1609.344],
        ['nmi', 'Nautical mile', 'nmi', 1852]
      ]
    },
    {
      id: 'mass',
      label: 'Weight',
      defaults: ['kg', 'lb'],
      units: [
        ['mg', 'Milligram', 'mg', 0.000001],
        ['g', 'Gram', 'g', 0.001],
        ['kg', 'Kilogram', 'kg', 1],
        ['t', 'Tonne', 't', 1000],
        ['oz', 'Ounce', 'oz', 0.028349523125],
        ['lb', 'Pound', 'lb', 0.45359237],
        ['st', 'Stone', 'st', 6.35029318]
      ]
    },
    {
      id: 'temperature',
      label: 'Temperature',
      defaults: ['c', 'f'],
      units: [
        ['c', 'Celsius', '°C', null, (v) => v, (v) => v],
        ['f', 'Fahrenheit', '°F', null, (v) => (v - 32) * 5 / 9, (v) => v * 9 / 5 + 32],
        ['k', 'Kelvin', 'K', null, (v) => v - 273.15, (v) => v + 273.15]
      ]
    },
    {
      id: 'volume',
      label: 'Volume',
      defaults: ['l', 'gal'],
      units: [
        ['ml', 'Milliliter', 'mL', 0.001],
        ['l', 'Liter', 'L', 1],
        ['m3', 'Cubic meter', 'm³', 1000],
        ['tsp', 'Teaspoon (US)', 'tsp', 0.00492892159],
        ['tbsp', 'Tablespoon (US)', 'tbsp', 0.0147867648],
        ['cup', 'Cup (US)', 'cup', 0.2365882365],
        ['pt', 'Pint (US)', 'pt', 0.473176473],
        ['qt', 'Quart (US)', 'qt', 0.946352946],
        ['gal', 'Gallon (US)', 'gal', 3.785411784]
      ]
    },
    {
      id: 'data',
      label: 'Data',
      defaults: ['mb', 'gb'],
      units: [
        ['b', 'Byte', 'B', 1],
        ['kb', 'Kilobyte', 'KB', 1024],
        ['mb', 'Megabyte', 'MB', 1048576],
        ['gb', 'Gigabyte', 'GB', 1073741824],
        ['tb', 'Terabyte', 'TB', 1099511627776]
      ]
    },
    {
      id: 'area',
      label: 'Area',
      defaults: ['m2', 'ft2'],
      units: [
        ['cm2', 'Square centimeter', 'cm²', 0.0001],
        ['m2', 'Square meter', 'm²', 1],
        ['km2', 'Square kilometer', 'km²', 1000000],
        ['ft2', 'Square foot', 'ft²', 0.09290304],
        ['ac', 'Acre', 'ac', 4046.8564224],
        ['ha', 'Hectare', 'ha', 10000]
      ]
    },
    {
      id: 'speed',
      label: 'Speed',
      defaults: ['kmh', 'mph'],
      units: [
        ['ms', 'Meters per second', 'm/s', 1],
        ['kmh', 'Kilometers per hour', 'km/h', 0.2777777778],
        ['mph', 'Miles per hour', 'mph', 0.44704],
        ['kn', 'Knot', 'kn', 0.5144444444],
        ['fts', 'Feet per second', 'ft/s', 0.3048]
      ]
    },
    {
      id: 'time',
      label: 'Time',
      defaults: ['min', 'h'],
      units: [
        ['ms', 'Millisecond', 'ms', 0.001],
        ['s', 'Second', 's', 1],
        ['min', 'Minute', 'min', 60],
        ['h', 'Hour', 'h', 3600],
        ['d', 'Day', 'd', 86400],
        ['wk', 'Week', 'wk', 604800],
        ['yr', 'Year (365 days)', 'yr', 31536000]
      ]
    },
    {
      id: 'pressure',
      label: 'Pressure',
      defaults: ['bar', 'psi'],
      units: [
        ['pa', 'Pascal', 'Pa', 1],
        ['kpa', 'Kilopascal', 'kPa', 1000],
        ['bar', 'Bar', 'bar', 100000],
        ['mbar', 'Millibar', 'mbar', 100],
        ['psi', 'Pound per square inch', 'psi', 6894.757293168],
        ['atm', 'Atmosphere', 'atm', 101325],
        ['mmhg', 'Millimeter of mercury', 'mmHg', 133.322387415]
      ]
    },
    {
      id: 'energy',
      label: 'Energy',
      defaults: ['kcal', 'kj'],
      units: [
        ['j', 'Joule', 'J', 1],
        ['kj', 'Kilojoule', 'kJ', 1000],
        ['cal', 'Calorie', 'cal', 4.184],
        ['kcal', 'Kilocalorie', 'kcal', 4184],
        ['wh', 'Watt hour', 'Wh', 3600],
        ['kwh', 'Kilowatt hour', 'kWh', 3600000],
        ['btu', 'British thermal unit', 'BTU', 1055.05585262]
      ]
    },
    {
      id: 'angle',
      label: 'Angle',
      defaults: ['deg', 'rad'],
      units: [
        ['deg', 'Degree', '°', 1],
        ['rad', 'Radian', 'rad', 57.29577951308232],
        ['grad', 'Gradian', 'grad', 0.9],
        ['turn', 'Turn', 'turn', 360]
      ]
    }
  ].map(function (category) {
    category.units = category.units.map(function (row) {
      return { id: row[0], label: row[1], symbol: row[2], factor: row[3], toBase: row[4], fromBase: row[5] };
    });
    return category;
  });

  const catsEl = document.getElementById('cats');
  const amountEl = document.getElementById('amount');
  const fromEl = document.getElementById('from');
  const toEl = document.getElementById('to');
  const resultEl = document.getElementById('result');
  const sentenceEl = document.getElementById('sentence');
  const swapBtn = document.getElementById('swap');
  const copyBtn = document.getElementById('copy');
  const resetBtn = document.getElementById('reset');

  let active = CATEGORIES[0];

  function unitById(id) {
    return active.units.filter(function (item) { return item.id === id; })[0];
  }

  function toBase(unit, value) {
    return unit.factor === null ? unit.toBase(value) : value * unit.factor;
  }

  function fromBase(unit, value) {
    return unit.factor === null ? unit.fromBase(value) : value / unit.factor;
  }

  function format(value) {
    if (!isFinite(value)) return '—';
    const abs = Math.abs(value);
    if (abs !== 0 && (abs < 0.0001 || abs >= 1000000000)) return value.toExponential(4);
    return String(Number(value.toPrecision(8)));
  }

  function optionsHTML() {
    return active.units.map(function (unit) {
      return '<option value="' + unit.id + '">' + unit.label + ' (' + unit.symbol + ')</option>';
    }).join('');
  }

  function renderChips() {
    catsEl.innerHTML = CATEGORIES.map(function (category) {
      const current = category.id === active.id ? ' is-active' : '';
      return '<button class="chip' + current + '" type="button" data-cat="' + category.id + '">' + category.label + '</button>';
    }).join('');
  }

  function fillSelects(pair) {
    fromEl.innerHTML = optionsHTML();
    toEl.innerHTML = optionsHTML();
    fromEl.value = (pair && pair[0]) || active.defaults[0];
    toEl.value = (pair && pair[1]) || active.defaults[1];
  }

  function render() {
    const from = unitById(fromEl.value);
    const to = unitById(toEl.value);
    const raw = amountEl.value.trim().replace(/[\s,]/g, '');
    const value = raw === '' ? NaN : Number(raw);

    if (!from || !to || !isFinite(value)) {
      resultEl.textContent = '—';
      sentenceEl.textContent = 'Type a number to convert.';
      return;
    }

    const converted = fromBase(to, toBase(from, value));
    resultEl.textContent = format(converted);
    sentenceEl.textContent = format(value) + ' ' + (from.symbol || from.label) +
      ' = ' + format(converted) + ' ' + (to.symbol || to.label);
  }

  catsEl.addEventListener('click', function (event) {
    const chip = event.target.closest('[data-cat]');
    if (!chip) return;
    active = CATEGORIES.filter(function (category) {
      return category.id === chip.getAttribute('data-cat');
    })[0];
    renderChips();
    fillSelects();
    render();
  });

  amountEl.addEventListener('input', render);
  fromEl.addEventListener('change', render);
  toEl.addEventListener('change', render);

  swapBtn.addEventListener('click', function () {
    const from = fromEl.value;
    fromEl.value = toEl.value;
    toEl.value = from;
    render();
  });

  copyBtn.addEventListener('click', function () {
    const text = resultEl.textContent;
    if (!text || text === '—') {
      SS.toast('Nothing to copy yet');
      return;
    }
    SS.copy(text);
  });

  resetBtn.addEventListener('click', function () {
    amountEl.value = '1';
    fillSelects();
    render();
  });

  renderChips();
  fillSelects();
  render();
})();
