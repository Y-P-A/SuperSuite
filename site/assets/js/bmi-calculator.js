/* BMI calculator — metric or imperial, with the category band and the healthy
   weight window for the height you typed. */
(function () {
  const el = (id) => document.getElementById(id);

  const BANDS = [
    { max: 18.5, label: 'Underweight', tone: 't-sky' },
    { max: 25, label: 'Healthy', tone: 't-green' },
    { max: 30, label: 'Overweight', tone: 't-orange' },
    { max: Infinity, label: 'Obese', tone: 't-red' }
  ];

  let unit = 'metric';

  function num(input, fallback) {
    const value = parseFloat(String(input.value).replace(/[^0-9.-]/g, ''));
    return isFinite(value) ? value : (fallback || 0);
  }

  function heightMetres() {
    if (unit === 'metric') return num(el('cm')) / 100;
    const ft = num(el('ft')) * 12 + num(el('inch'));
    return ft * 0.0254;
  }

  function weightKg() {
    return unit === 'metric' ? num(el('kg')) : num(el('lb')) * 0.45359237;
  }

  function weightInUnit(kg) {
    if (unit === 'metric') return kg.toFixed(1) + ' kg';
    return (kg / 0.45359237).toFixed(1) + ' lb';
  }

  function categoryOf(bmi) {
    return BANDS.find((band) => bmi < band.max) || BANDS[BANDS.length - 1];
  }

  function update() {
    const metres = heightMetres();
    const kg = weightKg();

    if (metres < 0.5 || kg <= 0) {
      el('bmi').textContent = '—';
      el('category').textContent = '—';
      el('meter').style.width = '0%';
      el('range').textContent = 'Enter a height and a weight to see your numbers.';
      return;
    }

    const bmi = kg / (metres * metres);
    const band = categoryOf(bmi);

    el('bmi').textContent = bmi.toFixed(1);
    el('category').textContent = band.label;
    el('meter').className = 'meter__fill ' + band.tone;
    /* 12 → 0%, 42 → 100%: the useful stretch of the BMI scale. */
    el('meter').style.width = Math.min(Math.max((bmi - 12) / 30 * 100, 2), 100) + '%';

    const low = 18.5 * metres * metres;
    const high = 24.9 * metres * metres;
    el('range').textContent =
      'A healthy weight for your height is about ' + weightInUnit(low) + ' to ' + weightInUnit(high) + '.';
  }

  el('units').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-unit]');
    if (!chip) return;
    unit = chip.getAttribute('data-unit');
    el('units').querySelectorAll('[data-unit]').forEach((button) => {
      button.classList.toggle('is-active', button === chip);
    });
    el('metric-fields').hidden = unit !== 'metric';
    el('imperial-fields').hidden = unit !== 'imperial';
    update();
  });

  ['cm', 'kg', 'ft', 'inch', 'lb'].forEach((id) => el(id).addEventListener('input', update));
  update();
})();
