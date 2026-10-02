/* World Clock — city clocks driven by Intl time zones, plus a picker. */
(function () {
  const CITIES = {
    london: { name: 'London', zone: 'Europe/London' },
    berlin: { name: 'Berlin', zone: 'Europe/Berlin' },
    moscow: { name: 'Moscow', zone: 'Europe/Moscow' },
    dubai: { name: 'Dubai', zone: 'Asia/Dubai' },
    karachi: { name: 'Karachi', zone: 'Asia/Karachi' },
    mumbai: { name: 'Mumbai', zone: 'Asia/Kolkata' },
    shanghai: { name: 'Shanghai', zone: 'Asia/Shanghai' },
    tokyo: { name: 'Tokyo', zone: 'Asia/Tokyo' },
    sydney: { name: 'Sydney', zone: 'Australia/Sydney' },
    newyork: { name: 'New York', zone: 'America/New_York' },
    chicago: { name: 'Chicago', zone: 'America/Chicago' },
    denver: { name: 'Denver', zone: 'America/Denver' },
    losangeles: { name: 'Los Angeles', zone: 'America/Los_Angeles' },
    saopaulo: { name: 'São Paulo', zone: 'America/Sao_Paulo' },
    cairo: { name: 'Cairo', zone: 'Africa/Cairo' },
    lagos: { name: 'Lagos', zone: 'Africa/Lagos' },
    utc: { name: 'UTC', zone: 'UTC' }
  };

  const DEFAULT_ON = ['london', 'dubai', 'newyork', 'tokyo', 'losangeles', 'sydney'];
  const clocks = document.getElementById('clocks');
  const picker = document.getElementById('picker');
  const localEl = document.getElementById('local');
  const localZone = document.getElementById('local-zone');
  let active = DEFAULT_ON.slice();

  localZone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';

  function timeIn(zone) {
    return new Intl.DateTimeFormat([], { timeZone: zone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  }
  function secondsIn(zone) {
    return new Intl.DateTimeFormat([], { timeZone: zone, second: '2-digit', hour12: false }).format(new Date());
  }
  function dayIn(zone) {
    return new Intl.DateTimeFormat([], { timeZone: zone, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
  }
  function hourIn(zone) {
    return Number(new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', hour12: false }).format(new Date()));
  }

  function renderPicker() {
    const available = Object.keys(CITIES).filter((key) => !active.includes(key));
    picker.innerHTML = '<option value="">' + (available.length ? 'Pick a city…' : 'All cities added') + '</option>' +
      available.map((key) => '<option value="' + key + '">' + CITIES[key].name + '</option>').join('');
    picker.disabled = !available.length;
    const remove = document.getElementById('remove-city');
    remove.innerHTML = '<option value="">' + (active.length ? 'Pick a city…' : 'No cities to remove') + '</option>' +
      active.map((key) => '<option value="' + key + '">' + CITIES[key].name + '</option>').join('');
    remove.disabled = !active.length;
  }

  function renderClocks() {
    if (!active.length) {
      clocks.innerHTML = '<p class="muted small">Pick at least one city above.</p>';
      return;
    }
    clocks.innerHTML = active.map(function (key) {
      const city = CITIES[key];
      const hour = hourIn(city.zone);
      const period = hour < 6 ? 'Night' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
      const offset = new Intl.DateTimeFormat('en-GB', { timeZone: city.zone, timeZoneName: 'shortOffset' })
        .formatToParts(new Date()).find(function (p) { return p.type === 'timeZoneName'; });
      return '<div class="clock-card" data-zone="' + city.zone + '">' +
        '<span class="clock-card__name">' + city.name + '</span>' +
        '<span class="clock-card__time mono" data-time>--:--</span>' +
        '<span class="clock-card__meta small">' + dayIn(city.zone) + ' · ' + period + ' · ' + (offset ? offset.value : '') + '</span>' +
        '</div>';
    }).join('');
  }

  function tick() {
    localEl.textContent = new Date().toLocaleTimeString([], { hour12: false });
    document.querySelectorAll('.clock-card').forEach(function (card) {
      const zone = card.getAttribute('data-zone');
      card.querySelector('[data-time]').textContent = timeIn(zone) + ':' + secondsIn(zone);
    });
  }

  [picker, document.getElementById('remove-city')].forEach(function (select) {
    select.addEventListener('change', function (event) {
      const key = event.target.value;
      if (!key) return;
      active = select === picker ? active.concat(key) : active.filter((city) => city !== key);
      renderPicker();
      renderClocks();
      tick();
    });
  });

  renderPicker();
  renderClocks();
  tick();
  setInterval(tick, 1000);
})();
