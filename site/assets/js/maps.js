/* Maps Explorer: a Google Maps embed plus place search, map types,
   zoom, geolocation, and share/copy helpers. */
(function () {
  const frame = document.getElementById('map');
  const form = document.getElementById('search-form');
  const queryEl = document.getElementById('query');
  const zoomVal = document.getElementById('zoom-val');
  const statusEl = document.getElementById('status');
  const openMaps = document.getElementById('open-maps');

  const state = { query: queryEl.value, type: 'm', zoom: 13 };

  const TYPE_LABEL = { m: 'Roadmap', k: 'Satellite', p: 'Terrain' };

  function embedUrl() {
    return 'https://www.google.com/maps?q=' + encodeURIComponent(state.query) +
      '&t=' + state.type + '&z=' + state.zoom + '&output=embed';
  }

  function publicUrl() {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(state.query);
  }

  function render(message) {
    frame.src = embedUrl();
    openMaps.href = publicUrl();
    zoomVal.textContent = String(state.zoom);
    document.getElementById('map-type').value = state.type;
    if (message) statusEl.textContent = message;
  }

  function setQuery(value, message) {
    state.query = value.trim() || state.query;
    queryEl.value = state.query;
    const places = document.getElementById('places');
    places.value = Array.from(places.options).some((option) => option.value === state.query) ? state.query : '';
    const coords = state.query.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    render(message || (coords
      ? 'Showing the pin at ' + coords[1] + ', ' + coords[2] + '.'
      : 'Showing ' + TYPE_LABEL[state.type].toLowerCase() + ' view of "' + state.query + '".'));
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    setQuery(queryEl.value);
  });

  document.getElementById('map-type').addEventListener('change', (event) => {
    state.type = event.target.value;
    render('Map type: ' + TYPE_LABEL[state.type] + '.');
  });

  document.querySelectorAll('[data-zoom]').forEach((button) => {
    button.addEventListener('click', () => {
      const step = +button.getAttribute('data-zoom');
      state.zoom = Math.min(21, Math.max(2, state.zoom + step));
      render('Zoom level ' + state.zoom + '.');
    });
  });

  document.getElementById('places').addEventListener('change', (event) => {
    if (event.target.value) setQuery(event.target.value);
  });

  document.getElementById('locate').addEventListener('click', () => {
    if (!navigator.geolocation) {
      statusEl.textContent = 'This browser will not share a location.';
      return;
    }
    statusEl.textContent = 'Finding your location\u2026';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.zoom = Math.max(state.zoom, 15);
        setQuery(position.coords.latitude.toFixed(5) + ', ' + position.coords.longitude.toFixed(5),
          'That is you. Your location stays in this browser.');
      },
      () => {
        statusEl.textContent = 'Location permission was refused.';
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  });

  document.getElementById('copy-link').addEventListener('click', () => {
    SS.copy('https://www.google.com/maps?q=' + encodeURIComponent(state.query) + '&t=' + state.type + '&z=' + state.zoom);
  });

  render();
})();
