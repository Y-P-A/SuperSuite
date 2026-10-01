/* Lorem Ipsum — assembles filler text from a small Latin word bank. */
(function () {
  const WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
    'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ' +
    'ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit ' +
    'voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non ' +
    'proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');

  const output = document.getElementById('output');
  const unit = document.getElementById('unit');
  const count = document.getElementById('count');
  const startSel = document.getElementById('start');
  const htmlWrap = document.getElementById('html');

  function pick() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }

  function sentence(minWords, maxWords) {
    const n = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
    const body = [];
    for (let i = 0; i < n; i++) body.push(pick());
    const text = body.join(' ');
    return text.charAt(0).toUpperCase() + text.slice(1) + '.';
  }

  function paragraph() {
    const sentences = 3 + Math.floor(Math.random() * 3);
    const body = [];
    for (let i = 0; i < sentences; i++) body.push(sentence(8, 18));
    return body.join(' ');
  }

  function generate() {
    const n = Math.max(1, Math.min(100, Number(count.value) || 1));
    const loremLead = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    let parts = [];
    const kind = unit.value;

    if (kind === 'words') {
      const words = [];
      for (let i = 0; i < n; i++) words.push(pick());
      parts = [words.join(' ').replace(/^\w/, function (c) { return c.toUpperCase(); }) + '.'];
    } else if (kind === 'sentences') {
      for (let i = 0; i < n; i++) parts.push(sentence(8, 18));
      if (startSel.value === 'lorem') parts[0] = loremLead;
    } else {
      for (let i = 0; i < n; i++) parts.push(paragraph());
      if (startSel.value === 'lorem') {
        parts[0] = loremLead + ' ' + parts[0];
      }
    }

    let text = parts.join(kind === 'paragraphs' ? '\n\n' : ' ');
    output.textContent = text;
    if (htmlWrap.checked) {
      output.textContent = (kind === 'paragraphs' ? parts : [text])
        .map(function (p) { return '&lt;p&gt;' + p + '&lt;/p&gt;'; }).join('\n');
    }
  }

  document.getElementById('generate').addEventListener('click', generate);
  document.getElementById('copy').addEventListener('click', function () {
    if (output.textContent) SS.copy(output.textContent);
  });
  [unit, count, startSel, htmlWrap].forEach(function (el) { el.addEventListener('change', generate); });

  generate();
})();
