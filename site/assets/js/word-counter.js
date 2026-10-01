/* Word Counter — live stats plus a keyword density list. */
(function () {
  const text = document.getElementById('text');
  const keywordBox = document.getElementById('keywords');

  const STOP = new Set(('the a an and or but if of to in on at for with as is are was were be been ' +
    'it its this that these those you your i we they he she his her not no so do does did from by ' +
    'can will just than then there here what which who when how all any each more most other some ' +
    'such only own same too very s t don now').split(' '));

  function readingTime(words) {
    const seconds = Math.round((words / 200) * 60);
    if (words === 0) return '0s';
    if (seconds < 60) return seconds + 's';
    return Math.round(seconds / 60) + ' min';
  }

  function keywords(words) {
    const counts = {};
    words.forEach(function (raw) {
      const word = raw.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');
      if (word.length < 3 || STOP.has(word)) return;
      counts[word] = (counts[word] || 0) + 1;
    });
    const top = Object.keys(counts)
      .map(function (word) { return { word: word, n: counts[word] }; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 12);
    if (!top.length) {
      keywordBox.innerHTML = '<span class="muted small">Words you use most will show up here.</span>';
      return;
    }
    keywordBox.innerHTML = top.map(function (item) {
      return '<span class="chip">' + item.word + ' &middot; ' + item.n + '</span>';
    }).join('');
  }

  function render() {
    const value = text.value;
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/) : [];
    const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+/g) || (trimmed ? [trimmed] : [])).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length : 0;

    document.getElementById('words').textContent = words.length.toLocaleString();
    document.getElementById('chars').textContent = value.length.toLocaleString();
    document.getElementById('charsns').textContent = value.replace(/\s/g, '').length.toLocaleString();
    document.getElementById('sentences').textContent = sentences.toLocaleString();
    document.getElementById('paragraphs').textContent = paragraphs.toLocaleString();
    document.getElementById('reading').textContent = readingTime(words.length);
    keywords(words);
  }

  text.addEventListener('input', render);
  document.getElementById('clear').addEventListener('click', function () {
    text.value = '';
    render();
    text.focus();
  });

  render();
})();
