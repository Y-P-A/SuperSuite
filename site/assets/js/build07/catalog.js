/* Build 0.7: categories are functional, not alphabetical buckets. */
(function () {
  const catalog = window.SS_CATALOG;
  if (!catalog) return;
  const categories = [
    { id: 'math', name: 'Math & Numbers', color: '#6554c0', main: '/tools/calculator', icon: '∑' },
    { id: 'coding', name: 'Coding & Developing', color: '#087f73', main: '/tools/codehub', icon: '</>' },
    { id: 'text', name: 'Text & Converting', color: '#b9630b', main: '/tools/notes', icon: 'Aa' },
    { id: 'media', name: 'Media & Design', color: '#bc347d', main: '/tools/music-lab', icon: '◈' },
    { id: 'everyday', name: 'Everyday & Productivity', color: '#246aa5', main: '/tools/todo', icon: '✓' }
  ];
  const existing = {
    math: ['calculator', 'base-converter', 'roman-numerals', 'percentage-calculator', 'loan-calculator', 'tip-splitter', 'discount-calculator', 'unit-converter'],
    coding: ['encoder', 'hash-generator', 'json-formatter', 'password-generator', 'slug-generator', 'data-size-converter'],
    text: ['case-converter', 'text-filters', 'lorem-ipsum', 'markdown', 'morse-code', 'notes', 'word-counter', 'text-diff', 'image-converter'],
    media: ['color-picker', 'gradient-generator', 'music-lab', 'qr-code'],
    everyday: ['bmi-calculator', 'cooking-converter', 'countdown-timer', 'date-calculator', 'maps', 'stopwatch', 'todo', 'world-clock']
  };
  const additions = {
    math: [
      ['fraction-calculator', 'Fraction Calculator', 'Add, subtract, multiply and divide exact fractions.'],
      ['statistics', 'Statistics', 'Mean, median, range, variance and standard deviation.'],
      ['prime-checker', 'Prime Checker', 'Check primality and factorise safe integers.'],
      ['gcd-lcm', 'GCD & LCM', 'Greatest common divisor and least common multiple.'],
      ['quadratic-solver', 'Quadratic Solver', 'Real and complex roots, discriminant and vertex.'],
      ['linear-system', 'Linear System Solver', 'Solve two simultaneous equations with determinant checks.'],
      ['triangle-solver', 'Triangle Solver', 'Three sides to angles, area and perimeter.'],
      ['circle-calculator', 'Circle Calculator', 'Radius to diameter, circumference and area.'],
      ['volume-calculator', 'Volume Calculator', 'Sphere, cylinder and cuboid volumes and surface areas.'],
      ['compound-interest', 'Compound Interest', 'Principal, contributions and compound growth.'],
      ['simple-interest', 'Simple Interest', 'Interest and final balance with explicit year units.'],
      ['investment-return', 'Investment Return', 'Total and annualised returns with holding period.'],
      ['scientific-notation', 'Scientific Notation', 'Normalised notation, engineering notation and decimal.'],
      ['number-sequence', 'Number Sequence', 'Arithmetic and geometric sequences with sums.'],
      ['combinatorics', 'Combinatorics', 'Exact factorials, combinations and permutations.'],
      ['probability', 'Binomial Probability', 'Exact-k, at-most-k and at-least-k probability.'],
      ['ratio-calculator', 'Ratio Calculator', 'Simplify integer ratios and scale to a total.'],
      ['rounding', 'Rounding', 'Decimal places, significant figures, floor and ceiling.'],
      ['random-numbers', 'Random Numbers', 'Cryptographically random integers within your limits.'],
      ['matrix-calculator', 'Matrix Calculator', '2×2 multiplication, determinant and inverse.'],
      ['distance-calculator', 'Coordinate Distance', '2D distance, midpoint and slope.'],
      ['logarithm', 'Logarithm Calculator', 'Logarithms in any valid base and natural logs.']
    ],
    coding: [
      ['codehub', 'CodeHub', 'Python 314.0.7, HTML/CSS/JS, Node.js, C/C++ WASM, Java and Kotlin.'],
      ['regex-tester', 'Regex Tester', 'Match patterns, inspect groups and test flags.'],
      ['csv-json', 'CSV ↔ JSON', 'Quoted CSV parsing and JSON array export.'],
      ['json-path', 'JSON Path Explorer', 'Resolve dot paths and array indexes in JSON.'],
      ['json-merge', 'JSON Merge', 'Recursively merge objects with explicit array replacement.'],
      ['json-schema', 'JSON Shape Inspector', 'Infer the structure and types of a JSON sample.'],
      ['uuid-generator', 'UUID Generator', 'Generate random RFC 4122 version 4 identifiers.'],
      ['timestamp', 'Unix Timestamp', 'Seconds or milliseconds to ISO dates and back.'],
      ['url-parser', 'URL Inspector', 'Protocol, hostname, path, fragments and parameters.'],
      ['query-builder', 'Query String Builder', 'Build encoded query parameters from a JSON object.'],
      ['html-escape', 'HTML Escape', 'Escape or decode HTML entities without executing markup.'],
      ['css-units', 'CSS Unit Converter', 'Convert px, rem, em and viewport units.'],
      ['css-clamp', 'Fluid Type Builder', 'Generate a CSS clamp from two viewport sizes.'],
      ['flexbox', 'Flexbox Builder', 'Generate flex layout CSS with live alignment preview.'],
      ['grid-builder', 'CSS Grid Builder', 'Columns, rows and gap with preview and copyable CSS.'],
      ['robots-builder', 'Robots.txt Builder', 'User-agent, disallow paths and sitemap directives.'],
      ['meta-tags', 'Meta Tag Builder', 'Escaped title, description and social sharing tags.'],
      ['sql-insert', 'SQL INSERT Builder', 'JSON rows to safely quoted SQL literals.'],
      ['http-status', 'HTTP Status Reference', 'Look up common response codes and their meanings.'],
      ['ip-subnet', 'IPv4 Subnet Calculator', 'Network, mask, broadcast and usable host range.'],
      ['jwt-inspector', 'JWT Inspector', 'Decode header and payload; never claims signature verification.'],
      ['hmac', 'HMAC Generator', 'Local HMAC-SHA-256 signatures with your own key.'],
      ['byte-inspector', 'UTF-8 Byte Inspector', 'Inspect bytes, code points and byte lengths.'],
      ['json-table', 'JSON Table', 'Inspect arrays of objects as a searchable data table.']
    ],
    text: [
      ['line-sorter', 'Line Sorter', 'Alphabetical, numeric, reversed or length-based sorting.'],
      ['duplicate-lines', 'Duplicate Line Cleaner', 'Remove repeated lines, optionally ignoring case.'],
      ['whitespace-cleaner', 'Whitespace Cleaner', 'Trim lines, collapse spaces and remove empty lines.'],
      ['find-replace', 'Find & Replace', 'Literal search and replacement, with case options.'],
      ['text-reverser', 'Text Reverser', 'Reverse characters, words or line order.'],
      ['unicode-inspector', 'Unicode Inspector', 'Code points, UTF-16 units and normalisation forms.'],
      ['unicode-styler', 'Unicode Styler', 'Bold, monospace and fullwidth Unicode alphabets.'],
      ['text-wrapper', 'Text Wrapper', 'Wrap paragraphs to a chosen character width.'],
      ['line-numbering', 'Line Numbering', 'Number lines from any starting integer.'],
      ['list-formatter', 'List Formatter', 'Bullet, numbered and checklist formats.'],
      ['text-extractor', 'Text Extractor', 'Extract URLs, email addresses or numbers.'],
      ['html-text', 'HTML to Text', 'Convert markup into readable plain text.'],
      ['readability', 'Readability Estimate', 'Estimated reading ease and grade level for English.'],
      ['frequency', 'Word Frequency', 'Rank words with counts and percentages.'],
      ['n-grams', 'N-gram Counter', 'Count repeated word pairs and longer phrases.'],
      ['text-chunker', 'Text Chunker', 'Split text into bounded chunks for copying.'],
      ['prefix-suffix', 'Prefix & Suffix', 'Add custom text around every non-empty line.'],
      ['delimiter-converter', 'Delimiter Converter', 'Convert simple separated lists to another delimiter.'],
      ['accent-remover', 'Accent Remover', 'Remove combining accents without discarding other scripts.'],
      ['punctuation-cleaner', 'Punctuation Normaliser', 'Straighten quotes, dashes and typographic spacing.'],
      ['text-compare', 'Text Similarity', 'Token overlap and multiset similarity comparison.']
    ],
    media: [
      ['contrast-checker', 'Contrast Checker', 'WCAG contrast ratio and AA/AAA text checks.'],
      ['palette-generator', 'Palette Generator', 'Complementary, analogous and triadic color palettes.'],
      ['color-mixer', 'Color Mixer', 'Blend two RGB colors by percentage.'],
      ['color-harmonies', 'Color Harmonies', 'Split-complementary and tetradic color relationships.'],
      ['hex-rgb', 'HEX ↔ RGB', 'Convert hex colors and inspect RGB/HSL channels.'],
      ['aspect-ratio', 'Aspect Ratio', 'Simplify dimensions and fit to another width.'],
      ['dpi-calculator', 'DPI Calculator', 'Pixels, print dimensions and resolution.'],
      ['svg-pattern', 'SVG Pattern', 'Downloadable dots, stripes and checker patterns.'],
      ['svg-shape', 'SVG Shape Builder', 'Generate editable circles, rectangles and polygons.'],
      ['avatar-maker', 'Initial Avatar', 'Make a downloadable initial avatar in SVG.'],
      ['banner-maker', 'Banner Maker', 'Text banners with custom dimensions and colors.'],
      ['placeholder-image', 'Placeholder Image', 'Download labelled placeholder graphics.'],
      ['favicon-maker', 'Favicon Maker', 'Build a scalable monogram favicon.'],
      ['border-radius', 'Border Radius Builder', 'Preview corners and copy CSS.'],
      ['box-shadow', 'Box Shadow Builder', 'Preview offsets, blur and spread with CSS output.'],
      ['text-shadow', 'Text Shadow Builder', 'Preview and generate text shadow declarations.'],
      ['css-filter', 'CSS Filter Builder', 'Preview brightness, contrast and saturation filters.'],
      ['clip-path', 'Clip Path Builder', 'Generate common polygon clipping masks.'],
      ['typography-scale', 'Typography Scale', 'Generate a modular font-size scale.'],
      ['spacing-scale', 'Spacing Scale', 'Build consistent spacing tokens.'],
      ['bezier', 'Bezier Easing', 'Preview and copy cubic-bezier easing curves.'],
      ['animation-builder', 'Animation Builder', 'Generate fade, slide and spin keyframes.'],
      ['bpm-delay', 'BPM Delay Calculator', 'Tempo to note durations and delay times.'],
      ['note-frequency', 'Note Frequency', 'MIDI note to frequency with custom tuning.'],
      ['tone-generator', 'Tone Generator', 'Play a bounded sine, square or triangle tone.'],
      ['audio-duration', 'Audio Size Calculator', 'PCM sample rate, channels and duration to file size.']
    ],
    everyday: [
      ['pomodoro', 'Focus Timer', 'Choose a focus interval and start a visible countdown.'],
      ['habit-tracker', 'Habit Tracker', 'A local daily checklist saved by date.'],
      ['daily-planner', 'Daily Planner', 'Save a dated plan in this browser.'],
      ['budget-planner', 'Budget Planner', 'Income and expense rows with balance and totals.'],
      ['savings-goal', 'Savings Goal', 'Months to a goal and required monthly savings.'],
      ['salary-converter', 'Salary Converter', 'Hourly, weekly, monthly and annual pay estimates.'],
      ['time-duration', 'Duration Calculator', 'Total hours and minutes across duration entries.'],
      ['time-zone', 'Time Zone Converter', 'Convert a UTC instant to IANA time zones.'],
      ['business-days', 'Business Days', 'Weekday counts with optional holiday exclusions.'],
      ['week-number', 'ISO Week Number', 'ISO week, year, weekday and week boundaries.'],
      ['countdown-date', 'Date Countdown', 'Time remaining until your target instant.'],
      ['calendar-maker', 'Monthly Calendar', 'Generate and download a printable month grid.'],
      ['packing-list', 'Packing List', 'An editable trip checklist saved locally.'],
      ['decision-picker', 'Decision Picker', 'Choose fairly between your own options.'],
      ['weighted-picker', 'Weighted Picker', 'Choose an option using your supplied weights.'],
      ['fuel-cost', 'Fuel Cost', 'Distance, efficiency and fuel price to trip cost.'],
      ['travel-time', 'Travel Time', 'Distance, speed and breaks to journey duration.'],
      ['pace-calculator', 'Pace Calculator', 'Running distance and finish time to pace.'],
      ['recipe-scaler', 'Recipe Scaler', 'Scale ingredient quantities to your serving count.'],
      ['water-estimate', 'Water Estimate', 'A general weight-based daily hydration estimate.'],
      ['sleep-planner', 'Sleep Planner', 'Bedtimes for approximate 90-minute sleep cycles.'],
      ['meeting-agenda', 'Meeting Agenda', 'Timed agenda rows with cumulative start offsets.']
    ]
  };
  categories.forEach(function (cat) {
    existing[cat.id].forEach(function (slug) {
      const item = catalog.utilities.find(function (entry) { return entry.href === '/tools/' + slug; });
      item.category = cat.id;
    });
    additions[cat.id].forEach(function (row) {
      catalog.utilities.push({ name: row[1], desc: row[2], href: row[0] === 'codehub' ? '/tools/codehub' : '/tools/' + row[0], category: cat.id, glyph: cat.icon });
    });
  });
  catalog.utilities.forEach(function (item) {
    const cat = categories.find(function (c) { return c.id === item.category; });
    item.tone = 'cat-' + cat.id;
    item.tag = cat.name;
    item.main = item.href === cat.main;
    if (item.href === '/tools/notes') { item.name = 'TextHub'; item.desc = 'Multiple autosaved notes, fonts, Unicode, search and text export.'; }
    if (item.href === '/tools/image-converter') { item.name = 'Converter+'; item.desc = 'Images, PDFs, WebP, BMP, SVG wrappers, video and audio conversion.'; }
    if (item.href === '/tools/calculator') item.desc = 'Scientific expressions, trigonometry, powers, memory and a running tape.';
  });
  catalog.categories = categories;
  catalog.utilities.sort(function (a, b) { return a.name.localeCompare(b.name); });
})();
