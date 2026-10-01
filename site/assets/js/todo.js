/* Todo List — a checklist kept in localStorage. */
(function () {
  const KEY = 'supersuite.notes.todo';
  const form = document.getElementById('add-form');
  const input = document.getElementById('task');
  const list = document.getElementById('list');
  const empty = document.getElementById('empty');
  const counts = document.getElementById('counts');
  let items = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(items)) items = [];
    } catch (err) { items = []; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (err) { /* ignore */ }
  }

  function render() {
    empty.hidden = items.length > 0;
    list.innerHTML = items.map(function (item, index) {
      return '<li class="todo__item' + (item.done ? ' is-done' : '') + '">' +
        '<label class="todo__label">' +
          '<input type="checkbox" data-toggle="' + index + '"' + (item.done ? ' checked' : '') + ' />' +
          '<span>' + item.text.replace(/[&<>]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
          }) + '</span>' +
        '</label>' +
        '<button class="btn" type="button" data-remove="' + index + '" aria-label="Delete task">Delete</button>' +
      '</li>';
    }).join('');

    const left = items.filter(function (item) { return !item.done; }).length;
    counts.textContent = left + ' to do · ' + (items.length - left) + ' done';
  }

  function commit() { save(); render(); }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    items.push({ text: text, done: false });
    input.value = '';
    commit();
    input.focus();
  });

  list.addEventListener('click', function (event) {
    const toggle = event.target.closest('[data-toggle]');
    if (toggle) {
      const index = Number(toggle.getAttribute('data-toggle'));
      items[index].done = toggle.checked;
      commit();
      return;
    }
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      items.splice(Number(remove.getAttribute('data-remove')), 1);
      commit();
    }
  });

  document.getElementById('clear-done').addEventListener('click', function () {
    items = items.filter(function (item) { return !item.done; });
    commit();
  });
  document.getElementById('clear-all').addEventListener('click', function () {
    if (!items.length || !confirm('Remove every task?')) return;
    items = [];
    commit();
  });

  load();
  render();
})();
