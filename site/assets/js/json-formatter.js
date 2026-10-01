/* JSON formatter: pretty-print, minify, validate (with line and column),
   alphabetical key sorting, copy and download. */
(function () {
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  const errorEl = document.getElementById('error');

  function read() {
    const text = inputEl.value.trim();
    if (!text) throw new Error('Nothing to format yet.');
    return JSON.parse(text);
  }

  /* Chrome reports "at position N"; turn that into a line and column. */
  function describe(error) {
    const message = error.message || String(error);
    const match = /position (\d+)/.exec(message);
    if (!match) return message;
    const position = Number(match[1]);
    const before = inputEl.value.slice(0, position);
    const line = before.split('\n').length;
    const column = position - before.lastIndexOf('\n');
    return message.replace(/ at position \d+/, '') + ' — line ' + line + ', column ' + column;
  }

  function sortValue(value) {
    if (Array.isArray(value)) return value.map(sortValue);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.keys(value).sort().map(function (key) {
        return [key, sortValue(value[key])];
      }));
    }
    return value;
  }

  function stats(value) {
    let keys = 0;
    let depth = 0;
    (function walk(node, level) {
      if (Array.isArray(node)) {
        depth = Math.max(depth, level);
        node.forEach(function (item) { walk(item, level); });
        return;
      }
      if (node && typeof node === 'object') {
        depth = Math.max(depth, level + 1);
        Object.keys(node).forEach(function (key) {
          keys++;
          walk(node[key], level + 1);
        });
      }
    })(value, 0);
    return keys + (keys === 1 ? ' key' : ' keys') + ' · ' + depth + (depth === 1 ? ' level' : ' levels');
  }

  function fail(error) {
    errorEl.hidden = false;
    errorEl.textContent = 'That is not valid JSON — ' + describe(error);
    statusEl.textContent = 'Nothing was changed. Fix the highlighted problem and try again.';
  }

  function succeed(value, message) {
    errorEl.hidden = true;
    outputEl.textContent = JSON.stringify(value, null, 2);
    statusEl.textContent = message + ' · ' + stats(value);
  }

  function run(transform, message) {
    let value;
    try {
      value = read();
    } catch (error) {
      fail(error);
      return;
    }
    succeed(transform ? transform(value) : value, message);
  }

  document.getElementById('format').addEventListener('click', function () {
    run(null, 'Formatted and valid');
  });

  document.getElementById('minify').addEventListener('click', function () {
    let value;
    try {
      value = read();
    } catch (error) {
      fail(error);
      return;
    }
    const text = JSON.stringify(value);
    errorEl.hidden = true;
    outputEl.textContent = text;
    statusEl.textContent = 'Minified to ' + text.length + ' characters · ' + stats(value);
  });

  document.getElementById('sort').addEventListener('click', function () {
    run(sortValue, 'Keys sorted A-Z');
  });

  document.getElementById('stringify').addEventListener('click', function () {
    let value;
    try {
      value = read();
    } catch (error) {
      fail(error);
      return;
    }
    const text = JSON.stringify(JSON.stringify(value));
    errorEl.hidden = true;
    outputEl.textContent = text;
    statusEl.textContent = 'Escaped as one JSON string literal · ' + text.length + ' characters';
  });

  document.getElementById('copy').addEventListener('click', function () {
    const text = outputEl.textContent;
    if (!text || text === '—') {
      SS.toast('Nothing to copy yet');
      return;
    }
    SS.copy(text);
  });

  document.getElementById('download').addEventListener('click', function () {
    const text = outputEl.textContent;
    if (!text || text === '—') {
      SS.toast('Nothing to download yet');
      return;
    }
    SS.download('formatted.json', new Blob([text], { type: 'application/json' }));
  });

  document.getElementById('clear').addEventListener('click', function () {
    inputEl.value = '';
    outputEl.textContent = '—';
    errorEl.hidden = true;
    statusEl.textContent = 'Paste something to get started.';
    inputEl.focus();
  });
})();
