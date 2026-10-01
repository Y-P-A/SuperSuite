/* Gradient Generator — a small list of colour stops rendered as CSS. */
(function () {
  const preview = document.getElementById('preview');
  const stopsBox = document.getElementById('stops');
  const angle = document.getElementById('angle');
  const angleLabel = document.getElementById('angle-label');
  const css = document.getElementById('css');

  let stops = ['#8e44ad', '#3498db', '#16a085'];

  function cssValue() {
    return 'linear-gradient(' + angle.value + 'deg, ' + stops.join(', ') + ')';
  }

  function renderStops() {
    stopsBox.innerHTML = stops.map(function (color, index) {
      return '<div class="row">' +
        '<input type="color" value="' + color + '" data-stop="' + index + '" style="flex:1;height:38px" />' +
        '<span class="mono small">' + color.toUpperCase() + '</span>' +
        '</div>';
    }).join('');
  }

  function render() {
    const value = cssValue();
    preview.style.backgroundImage = value;
    css.textContent = 'background-image: ' + value + ';';
    angleLabel.textContent = angle.value + '°';
  }

  stopsBox.addEventListener('input', function (event) {
    const input = event.target.closest('[data-stop]');
    if (!input) return;
    stops[Number(input.getAttribute('data-stop'))] = input.value;
    renderStops();
    render();
  });

  angle.addEventListener('input', render);

  document.getElementById('add').addEventListener('click', function () {
    if (stops.length >= 6) { SS.toast('Six stops is plenty'); return; }
    stops.push(randomColor());
    renderStops();
    render();
  });
  document.getElementById('remove').addEventListener('click', function () {
    if (stops.length <= 2) { SS.toast('Keep at least two stops'); return; }
    stops.pop();
    renderStops();
    render();
  });
  document.getElementById('reverse').addEventListener('click', function () {
    stops.reverse();
    renderStops();
    render();
  });
  document.getElementById('random').addEventListener('click', function () {
    stops = stops.map(randomColor);
    renderStops();
    render();
  });
  document.getElementById('copy').addEventListener('click', function () {
    SS.copy(css.textContent);
  });

  function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    return hslToHex(hue, 65, 55);
  }
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = function (n) { return (n + h / 30) % 12; };
    const a = s * Math.min(l, 1 - l);
    const f = function (n) {
      const value = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return Math.round(255 * value).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
  }

  renderStops();
  render();
})();
