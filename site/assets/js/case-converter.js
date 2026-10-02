/* Case Converter — one textarea in, one converted block out. */
(function () {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const modes = document.getElementById('modes');
  let mode = 'upper';

  const words = function (value) {
    return value.trim().split(/[\s_-]+/).filter(Boolean);
  };

  const TRANSFORM = {
    upper: function (v) { return v.toUpperCase(); },
    lower: function (v) { return v.toLowerCase(); },
    title: function (v) {
      return v.replace(/\p{L}[\p{L}']*/gu, function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
    },
    sentence: function (v) {
      return v.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, function (m) { return m.toUpperCase(); });
    },
    camel: function (v) {
      return words(v).map(function (word, index) {
        const clean = word.toLowerCase();
        return index === 0 ? clean : clean.charAt(0).toUpperCase() + clean.slice(1);
      }).join('');
    },
    pascal: function (v) {
      return words(v).map(function (word) {
        const clean = word.toLowerCase();
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      }).join('');
    },
    snake: function (v) { return words(v).join('_').toLowerCase(); },
    kebab: function (v) { return words(v).join('-').toLowerCase(); },
    constant: function (v) { return words(v).join('_').toUpperCase(); },
    alternating: function (v) {
      let up = false;
      return v.replace(/\p{L}/gu, function (c) { up = !up; return up ? c.toUpperCase() : c.toLowerCase(); });
    },
    inverse: function (v) {
      return v.replace(/\p{L}/gu, function (c) {
        return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
      });
    }
  };

  function render() {
    output.textContent = TRANSFORM[mode](input.value);
    modes.querySelectorAll('[data-mode]').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-mode') === mode);
    });
  }

  modes.addEventListener('click', function (event) {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    mode = button.getAttribute('data-mode');
    render();
  });

  input.addEventListener('input', render);

  document.getElementById('copy').addEventListener('click', function () {
    if (output.textContent) SS.copy(output.textContent);
  });
  document.getElementById('use').addEventListener('click', function () {
    input.value = output.textContent;
    render();
  });

  input.value = 'the quick brown fox jumps over the lazy dog';
  render();
})();
