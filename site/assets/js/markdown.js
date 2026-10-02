/* Markdown Preview — a small, self-contained Markdown renderer. Everything is
   escaped before any markup is added, and link targets are restricted to safe
   schemes so pasted text cannot inject script. */
(function () {
  const source = document.getElementById('source');
  const preview = document.getElementById('preview');

  function escapeHtml(value) {
    return value.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function safeHref(url) {
    return /^(https?:|mailto:|#|\/)/i.test(url) ? url : '#';
  }

  function inline(text) {
    return text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
        return '<a href="' + safeHref(url) + '" rel="noopener">' + label + '</a>';
      });
  }

  function render(markdown) {
    const raw = escapeHtml(markdown);
    const lines = raw.split('\n');
    const out = [];
    let list = null;      // 'ul' | 'ol'
    let inCode = false;
    let paragraph = [];

    function flushParagraph() {
      if (paragraph.length) {
        out.push('<p>' + inline(paragraph.join(' ')) + '</p>');
        paragraph = [];
      }
    }
    function closeList() {
      if (list) { out.push('</' + list + '>'); list = null; }
    }

    lines.forEach(function (line) {
      if (/^```/.test(line)) {
        flushParagraph(); closeList();
        out.push(inCode ? '</code></pre>' : '<pre><code>');
        inCode = !inCode;
        return;
      }
      if (inCode) { out.push(line); return; }

      const heading = /^(#{1,4})\s+(.*)$/.exec(line);
      if (heading) {
        flushParagraph(); closeList();
        const level = heading[1].length;
        out.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
        return;
      }
      if (/^\s*(---|\*\*\*)\s*$/.test(line)) { flushParagraph(); closeList(); out.push('<hr>'); return; }
      if (/^\s*&gt;\s?/.test(line)) {
        flushParagraph(); closeList();
        out.push('<blockquote>' + inline(line.replace(/^\s*&gt;\s?/, '')) + '</blockquote>');
        return;
      }
      const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
      const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
      if (bullet || ordered) {
        flushParagraph();
        const kind = bullet ? 'ul' : 'ol';
        if (list !== kind) { closeList(); out.push('<' + kind + '>'); list = kind; }
        out.push('<li>' + inline((bullet || ordered)[1]) + '</li>');
        return;
      }
      if (!line.trim()) { flushParagraph(); closeList(); return; }
      paragraph.push(line.trim());
    });

    flushParagraph(); closeList();
    if (inCode) out.push('</code></pre>');
    return out.join('\n');
  }

  function update() { preview.innerHTML = render(source.value); }

  const SAMPLE = [
    '# Markdown Preview',
    '',
    'Type on the left, watch it render on the right. **Bold**, *italic*, `inline code` and ~~strikethrough~~ all work.',
    '',
    '## Lists',
    '',
    '- Flat geometric icons',
    '- No build step',
    '- Runs entirely in your browser',
    '',
    '## Links and quotes',
    '',
    '> Everything is escaped before it is rendered, so pasted text cannot inject script.',
    '',
    'A [link](https://example.com) works too, and so do numbered lists:',
    '',
    '1. Write the Markdown',
    '2. Read the preview',
    '3. Copy the HTML',
    '',
    '```',
    'const greeting = "hello";',
    '```'
  ].join('\n');

  source.value = SAMPLE;
  source.addEventListener('input', update);
  document.getElementById('sample').addEventListener('click', function () {
    source.value = SAMPLE; update();
  });
  document.getElementById('copy-html').addEventListener('click', function () {
    SS.copy(render(source.value));
  });

  update();
})();
