/* Individual semantic marks for the expanded catalog; original SVGs stay intact. */
(function () {
  const symbols = {
    'fraction-calculator':'½', statistics:'σ', 'prime-checker':'P?', 'gcd-lcm':'G:L', 'quadratic-solver':'x²', 'linear-system':'x=y', 'triangle-solver':'△', 'circle-calculator':'πr', 'volume-calculator':'m³', 'compound-interest':'↗%', 'simple-interest':'I=Pr', 'investment-return':'ROI', 'scientific-notation':'10ⁿ', 'number-sequence':'1…n', combinatorics:'n!', probability:'P(k)', 'ratio-calculator':'a:b', rounding:'≈', 'random-numbers':'⚄', 'matrix-calculator':'[A]', 'distance-calculator':'Δxy', logarithm:'log',
    codehub:'>_', 'regex-tester':'.*', 'csv-json':'↔{}', 'json-path':'$.x', 'json-merge':'{}+', 'json-schema':'{T}', 'uuid-generator':'ID', timestamp:'UTC', 'url-parser':'://', 'query-builder':'?q=', 'html-escape':'&lt;', 'css-units':'rem', 'css-clamp':'min↔', flexbox:'↔↕', 'grid-builder':'▦', 'robots-builder':'bot', 'meta-tags':'<m>', 'sql-insert':'SQL', 'http-status':'200', 'ip-subnet':'IP/24', 'jwt-inspector':'JWT', hmac:'HMAC', 'byte-inspector':'0x', 'json-table':'{▤}',
    'line-sorter':'A↓Z', 'duplicate-lines':'≠≠', 'whitespace-cleaner':'␣', 'find-replace':'a→b', 'text-reverser':'↶abc', 'unicode-inspector':'U+', 'unicode-styler':'𝐀', 'text-wrapper':'↵', 'line-numbering':'1│', 'list-formatter':'•─', 'text-extractor':'@', 'html-text':'<a>A', readability:'Aa?', frequency:'ƒ(w)', 'n-grams':'ab·bc', 'text-chunker':'a│b', 'prefix-suffix':'+a+', 'delimiter-converter':',→;', 'accent-remover':'é→e', 'punctuation-cleaner':'“ ”', 'text-compare':'a≈b',
    'contrast-checker':'◐', 'palette-generator':'◒', 'color-mixer':'⊕', 'color-harmonies':'◉', 'hex-rgb':'#RGB', 'aspect-ratio':'16:9', 'dpi-calculator':'DPI', 'svg-pattern':'⠿', 'svg-shape':'◇', 'avatar-maker':'☺', 'banner-maker':'Bn', 'placeholder-image':'▧', 'favicon-maker':'F★', 'border-radius':'╭╮', 'box-shadow':'▣', 'text-shadow':'A▰', 'css-filter':'◑', 'clip-path':'✂', 'typography-scale':'aA', 'spacing-scale':'↤↦', bezier:'∿', 'animation-builder':'▷', 'bpm-delay':'BPM', 'note-frequency':'Hz', 'tone-generator':'∽', 'audio-duration':'PCM',
    pomodoro:'25′', 'habit-tracker':'✓7', 'daily-planner':'Day', 'budget-planner':'$±', 'savings-goal':'$↗', 'salary-converter':'$/h', 'time-duration':'h:m', 'time-zone':'TZ', 'business-days':'M–F', 'week-number':'W#', 'countdown-date':'D−', 'calendar-maker':'31', 'packing-list':'☑', 'decision-picker':'?', 'weighted-picker':'⚖', 'fuel-cost':'L/$', 'travel-time':'km/h', 'pace-calculator':'min/km', 'recipe-scaler':'×2', 'water-estimate':'H₂O', 'sleep-planner':'Zz', 'meeting-agenda':'⌘'
  };
  const frames = {
    math: '<path d="M4 8V4h4M24 8V4h-4M4 24v4h4M24 24v4h-4"/>',
    coding: '<path d="M7 4H4v24h3M25 4h3v24h-3M10 27h12"/>',
    text: '<path d="M5 4h22M5 28h22M5 7v18"/>',
    media: '<path d="M16 2l14 14-14 14L2 16z"/>',
    everyday: '<rect x="3" y="3" width="26" height="26" rx="7"/>'
  };
  window.SS_CATALOG.utilities.forEach(function (item) {
    if (item.icon) return;
    const slug = item.href.split('/').pop();
    const symbol = symbols[slug];
    if (!symbol) throw new Error('Missing utility mark: ' + slug);
    const size = symbol.length > 4 ? 6 : symbol.length > 3 ? 7 : symbol.length > 2 ? 9 : 13;
    item.icon = '<svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.5">' + frames[item.category] + '</g><text x="16" y="17" dominant-baseline="middle" text-anchor="middle" fill="currentColor" font-family="system-ui,sans-serif" font-size="' + size + '" font-weight="750">' + symbol.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</text></svg>';
    delete item.glyph;
  });
})();
