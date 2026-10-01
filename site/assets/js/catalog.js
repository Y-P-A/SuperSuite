/* The single source of truth for what SuperSuite ships.
   Home, /utilities and /games all render from these lists.

   Every entry carries a flat geometric SVG `icon` — the card logo. Icons are
   drawn with currentColor, so the card only has to set a text colour. */
(function () {
  /* One shared wrapper keeps every logo on the same grid and stroke. */
  function mark(body, paint) {
    return (
      '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' +
      'fill="' + (paint || 'none') + '" stroke="' + (paint ? 'none' : 'currentColor') + '" stroke-width="2">' +
      body +
      '</svg>'
    );
  }

  const ICON = {
    calculator: mark(
      '<rect x="4" y="2.5" width="16" height="19"/>' +
      '<rect x="7" y="5.5" width="10" height="4" fill="currentColor" stroke="none"/>' +
      '<path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke-linecap="square"/>'
    ),
    colorPicker: mark(
      '<circle cx="9.5" cy="9.5" r="5.5"/>' +
      '<circle cx="14.5" cy="9.5" r="5.5"/>' +
      '<circle cx="12" cy="15" r="5.5"/>'
    ),
    qrCode: mark(
      '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' +
      '<rect x="5.5" y="5.5" width="2" height="2" fill="currentColor" stroke="none"/>' +
      '<rect x="16.5" y="5.5" width="2" height="2" fill="currentColor" stroke="none"/>' +
      '<rect x="5.5" y="16.5" width="2" height="2" fill="currentColor" stroke="none"/>' +
      '<rect x="13.5" y="13.5" width="2.5" height="2.5" fill="currentColor" stroke="none"/>' +
      '<rect x="18.5" y="13.5" width="2.5" height="2.5" fill="currentColor" stroke="none"/>' +
      '<rect x="13.5" y="18.5" width="2.5" height="2.5" fill="currentColor" stroke="none"/>' +
      '<rect x="18.5" y="18.5" width="2.5" height="2.5" fill="currentColor" stroke="none"/>'
    ),
    maps: mark(
      '<path d="M12 2.5c-3.6 0-6.5 2.9-6.5 6.6 0 4.9 6.5 12.4 6.5 12.4s6.5-7.5 6.5-12.4c0-3.7-2.9-6.6-6.5-6.6z"/>' +
      '<circle cx="12" cy="9" r="2.4" fill="currentColor" stroke="none"/>'
    ),
    textFilters: mark('<path d="M3 4h18l-7 8v8l-4 2v-10L3 4z"/>'),
    imageConverter: mark(
      '<rect x="2.5" y="7" width="9" height="9"/>' +
      '<circle cx="5.5" cy="10" r="1" fill="currentColor" stroke="none"/>' +
      '<path d="M2.5 14.5l2.5-2.5 3 3"/>' +
      '<path d="M14.5 8h6.5M18 5l3 3-3 3"/>' +
      '<path d="M21 16h-6.5M17.5 13l-3 3 3 3"/>'
    ),
    unitConverter: mark(
      '<rect x="2.5" y="8" width="19" height="8"/>' +
      '<path d="M7 8v3M11 8v4.5M15 8v3M19 8v4.5"/>'
    ),
    password: mark(
      '<circle cx="7.5" cy="7.5" r="4.5"/>' +
      '<path d="M10.8 10.8L21 21M17.5 17.5l2.5-2.5M14 14l2.5-2.5"/>'
    ),
    json: mark(
      '<path d="M9 3.5c-2.5 0-2.2 2.6-2.2 4.8 0 2-1.3 2.9-3.3 3.7 2 .8 3.3 1.7 3.3 3.7 0 2.2-.3 4.8 2.2 4.8"/>' +
      '<path d="M15 3.5c2.5 0 2.2 2.6 2.2 4.8 0 2 1.3 2.9 3.3 3.7-2 .8-3.3 1.7-3.3 3.7 0 2.2.3 4.8-2.2 4.8"/>'
    ),
    encoder: mark(
      '<path d="M2.5 8.5h15M14 5l3.5 3.5L14 11.5"/>' +
      '<path d="M21.5 15.5h-15M10 12l-3.5 3.5L10 19"/>'
    ),
    wordCounter: mark(
      '<path d="M4 5h16M4 9.5h16M4 14h11M4 18.5h7"/>'
    ),
    caseConverter: mark(
      '<path d="M2.5 19L6.5 6l4 13M3.8 15h5.4"/>' +
      '<path d="M14 19v-8h2.6a2.6 2.6 0 010 5.2H14"/>'
    ),
    loremIpsum: mark(
      '<rect x="3.5" y="4" width="17" height="16"/>' +
      '<path d="M6.5 8h11M6.5 11.5h11M6.5 15h7"/>'
    ),
    markdown: mark(
      '<rect x="2.5" y="5.5" width="19" height="13"/>' +
      '<path d="M6 16V8l3 4 3-4v8M16 8v8M14 14l2 2.5 2-2.5"/>'
    ),
    textDiff: mark(
      '<rect x="3" y="3" width="8" height="18"/><rect x="13" y="3" width="8" height="18"/>' +
      '<path d="M5.5 8h3M15.5 16h3"/>'
    ),
    slugGenerator: mark(
      '<path d="M9.5 14.5l5-5"/>' +
      '<path d="M7 12l-1.4 1.4a3.6 3.6 0 005 5L12 17"/>' +
      '<path d="M17 12l1.4-1.4a3.6 3.6 0 00-5-5L12 7"/>'
    ),
    morseCode: mark(
      '<circle cx="4.5" cy="9" r="1.4" fill="currentColor" stroke="none"/>' +
      '<circle cx="9.5" cy="9" r="1.4" fill="currentColor" stroke="none"/><path d="M13.5 9H20"/>' +
      '<path d="M4 15.5h6"/><circle cx="14.5" cy="15.5" r="1.4" fill="currentColor" stroke="none"/>' +
      '<path d="M18.5 15.5H20"/>'
    ),
    romanNumerals: mark(
      '<path d="M5 5v14"/><path d="M10 5l4.5 14M14.5 5L10 19"/>'
    ),
    baseConverter: mark(
      '<rect x="3" y="7" width="7" height="10"/><rect x="14" y="7" width="7" height="10"/>' +
      '<path d="M10 12h4"/>'
    ),
    hashGenerator: mark(
      '<path d="M9.5 3L7.5 21M16.5 3l-2 18M4 9h16M3 15h16"/>'
    ),
    stopwatch: mark(
      '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 3h4M12 3v3M18.8 7.2l1.4-1.4"/>'
    ),
    countdownTimer: mark(
      '<circle cx="12" cy="13.5" r="8"/><path d="M12 13.5l4-3M4 6l1.6 1.6"/>'
    ),
    worldClock: mark(
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/>'
    ),
    percentageCalculator: mark(
      '<circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="M19 5L5 19"/>'
    ),
    dateCalculator: mark(
      '<rect x="3.5" y="5" width="17" height="15"/><path d="M3.5 9.5h17M8 3v4M16 3v4M12 13v4M10 15h4"/>'
    ),
    tipSplitter: mark(
      '<path d="M12 2.5v19"/>' +
      '<path d="M16.5 6.6c-1-1.3-2.7-2.1-4.5-2.1-2.5 0-4.5 1.4-4.5 3.5 0 2.4 2.6 3 4.5 3.6 2 .6 4.5 1.2 4.5 3.6 0 2.1-2 3.5-4.5 3.5-1.8 0-3.5-.8-4.5-2.1"/>'
    ),
    loanCalculator: mark(
      '<path d="M3 20.5h18"/><path d="M6.5 20.5V10M12 20.5V4.5M17.5 20.5v-8"/>'
    ),
    notes: mark(
      '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12.5h6M9 16.5h6"/>'
    ),
    todo: mark(
      '<path d="M4 7l2.4 2.4L11 4.8"/><path d="M4 16.5l2.4 2.4L11 14.3"/><path d="M14 8h6M14 17.5h6"/>'
    ),
    gradientGenerator: mark(
      '<rect x="3" y="3" width="18" height="18"/><path d="M21 3L3 21M13 3L3 13M21 11l-10 10"/>'
    ),
    tetris: mark(
      '<path d="M7 5h4v4H7zM11 5h4v4h-4zM3 9h4v4H3zM7 9h4v4H7z"/>',
      'currentColor'
    ),
    pong: mark(
      '<rect x="3" y="6" width="2.5" height="9"/>' +
      '<rect x="18.5" y="9" width="2.5" height="9"/>' +
      '<rect x="10.5" y="10" width="3" height="3"/>',
      'currentColor'
    ),
    breakout: mark(
      '<path d="M3 4h5.5v3.5H3zM9.5 4h5.5v3.5H9.5zM16 4h5v3.5h-5zM6.5 9h5.5v3.5H6.5zM13 9h5.5v3.5H13z"/>' +
      '<rect x="4" y="17.5" width="9" height="2.5"/><rect x="16.5" y="14" width="3" height="3"/>',
      'currentColor'
    ),
    snake: mark(
      '<path d="M4 6h11v5H8v7h8" stroke-linecap="square"/>' +
      '<rect x="17.5" y="3.5" width="3" height="3" fill="currentColor" stroke="none"/>'
    ),
    eaglercraft: mark(
      '<path d="M12 2.5l8.5 4.5v9L12 21.5 3.5 16v-9L12 2.5z"/>' +
      '<path d="M3.5 7L12 11.5 20.5 7M12 11.5v10"/>'
    ),
    flappy: mark(
      '<circle cx="10.5" cy="12" r="4.5"/>' +
      '<path d="M15 10l6-3v6z"/>' +
      '<circle cx="9" cy="11" r="0.9" fill="currentColor" stroke="none"/>'
    ),
    '2048': mark(
      '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>'
    ),
    memoryMatch: mark(
      '<rect x="3" y="4.5" width="8" height="15"/><rect x="13" y="4.5" width="8" height="15"/>'
    ),
    ticTacToe: mark(
      '<path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>'
    ),
    connectFour: mark(
      '<circle cx="6" cy="6.5" r="2"/><circle cx="12" cy="6.5" r="2"/><circle cx="18" cy="6.5" r="2"/>' +
      '<circle cx="6" cy="12.5" r="2"/><circle cx="12" cy="12.5" r="2"/><circle cx="18" cy="12.5" r="2"/>' +
      '<circle cx="9" cy="18.5" r="2"/><circle cx="15" cy="18.5" r="2"/>'
    ),
    minesweeper: mark(
      '<circle cx="12" cy="13.5" r="6"/><path d="M12 13.5V10M12 13.5l3 2M12 3.5v3M4 6l2.4 2.4M20 6l-2.4 2.4M3.5 13.5h3"/>'
    ),
    simonSays: mark(
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.8"/>' +
      '<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>'
    ),
    whackAMole: mark(
      '<circle cx="12" cy="14" r="4"/><path d="M8.5 11L4 8.5M15.5 11L20 8.5M12 10V4.5"/>' +
      '<path d="M9.5 13.5h.01M14.5 13.5h.01" stroke-linecap="square"/>'
    ),
    asteroids: mark(
      '<path d="M12 2.5l8 5.5-3 11H7L4 8z"/>' +
      '<circle cx="10" cy="10" r="1.5"/><circle cx="15" cy="14" r="1.2"/>'
    ),
    jumper: mark(
      '<rect x="4" y="19" width="16" height="2.5"/>' +
      '<circle cx="12" cy="8" r="3.5"/><path d="M9 14.5l3 3 3-3"/>'
    )
  };

  window.SS_CATALOG = {
    utilities: [
      {
        name: 'Calculator',
        desc: 'Fast flat calculator with keyboard support, memory keys and a running tape.',
        href: '/tools/calculator',
        tone: 't-blue',
        icon: ICON.calculator,
        tag: 'Utility 01'
      },
      {
        name: 'Color Picker',
        desc: 'Pick a color, convert it, copy it, and grab tints and shades.',
        href: '/tools/color-picker',
        tone: 't-orange',
        icon: ICON.colorPicker,
        tag: 'Utility 02'
      },
      {
        name: 'QR Code Generator',
        desc: 'Scannable QR codes with custom size, colors, error correction and download.',
        href: '/tools/qr-code',
        tone: 't-teal',
        icon: ICON.qrCode,
        tag: 'Utility 03'
      },
      {
        name: 'Maps Explorer',
        desc: 'Search any place, switch map types, jump to your location.',
        href: '/tools/maps',
        tone: 't-green',
        icon: ICON.maps,
        tag: 'Utility 04'
      },
      {
        name: 'Crazy Text Filters',
        desc: 'Mock, uwu, script, bubble and more — turn plain text weird.',
        href: '/tools/text-filters',
        tone: 't-purple',
        icon: ICON.textFilters,
        tag: 'Utility 05'
      },
      {
        name: 'Image Converter',
        desc: 'PNG, JPG and PDF both ways — with quality and resize controls.',
        href: '/tools/image-converter',
        tone: 't-pink',
        icon: ICON.imageConverter,
        tag: 'Utility 06'
      },
      {
        name: 'Unit Converter',
        desc: 'Length, weight, temperature, data, speed and more — converts as you type.',
        href: '/tools/unit-converter',
        tone: 't-sky',
        icon: ICON.unitConverter,
        tag: 'Utility 07'
      },
      {
        name: 'Password Generator',
        desc: 'Strong random passwords or passphrases, made in your browser.',
        href: '/tools/password-generator',
        tone: 't-red',
        icon: ICON.password,
        tag: 'Utility 08'
      },
      {
        name: 'JSON Formatter',
        desc: 'Paste messy JSON — tidy it, sort it, minify it, check it, copy it.',
        href: '/tools/json-formatter',
        tone: 't-yellow',
        icon: ICON.json,
        tag: 'Utility 09'
      },
      {
        name: 'Encoder / Decoder',
        desc: 'Base64, URL, HTML entities, hex, binary, ROT13 and JWT.',
        href: '/tools/encoder',
        tone: 't-ink',
        icon: ICON.encoder,
        tag: 'Utility 10'
      },
      {
        name: 'Word Counter',
        desc: 'Words, characters, sentences, reading time and keyword density.',
        href: '/tools/word-counter',
        tone: 't-sky',
        icon: ICON.wordCounter,
        tag: 'Utility 11'
      },
      {
        name: 'Case Converter',
        desc: 'UPPER, lower, Title, Sentence, camelCase, snake_case and more.',
        href: '/tools/case-converter',
        tone: 't-blue',
        icon: ICON.caseConverter,
        tag: 'Utility 12'
      },
      {
        name: 'Lorem Ipsum',
        desc: 'Classic placeholder text by paragraph, sentence or word count.',
        href: '/tools/lorem-ipsum',
        tone: 't-ink',
        icon: ICON.loremIpsum,
        tag: 'Utility 13'
      },
      {
        name: 'Markdown Preview',
        desc: 'Type Markdown on the left, see clean formatted HTML on the right.',
        href: '/tools/markdown',
        tone: 't-purple',
        icon: ICON.markdown,
        tag: 'Utility 14'
      },
      {
        name: 'Text Diff',
        desc: 'Compare two blocks of text and highlight every added and removed line.',
        href: '/tools/text-diff',
        tone: 't-red',
        icon: ICON.textDiff,
        tag: 'Utility 15'
      },
      {
        name: 'Slug Generator',
        desc: 'Turn any headline into a clean, URL-safe slug in one click.',
        href: '/tools/slug-generator',
        tone: 't-teal',
        icon: ICON.slugGenerator,
        tag: 'Utility 16'
      },
      {
        name: 'Morse Code',
        desc: 'Translate text to Morse and back, with a live audio beeper.',
        href: '/tools/morse-code',
        tone: 't-orange',
        icon: ICON.morseCode,
        tag: 'Utility 17'
      },
      {
        name: 'Roman Numerals',
        desc: 'Convert numbers to Roman numerals and back, with a quick table.',
        href: '/tools/roman-numerals',
        tone: 't-yellow',
        icon: ICON.romanNumerals,
        tag: 'Utility 18'
      },
      {
        name: 'Base Converter',
        desc: 'Binary, octal, decimal and hex — converted live as you type.',
        href: '/tools/base-converter',
        tone: 't-green',
        icon: ICON.baseConverter,
        tag: 'Utility 19'
      },
      {
        name: 'Hash Generator',
        desc: 'SHA-1, SHA-256 and SHA-512 digests of any text, computed locally.',
        href: '/tools/hash-generator',
        tone: 't-ink',
        icon: ICON.hashGenerator,
        tag: 'Utility 20'
      },
      {
        name: 'Stopwatch',
        desc: 'Precise stopwatch with laps — keyboard driven and always accurate.',
        href: '/tools/stopwatch',
        tone: 't-red',
        icon: ICON.stopwatch,
        tag: 'Utility 21'
      },
      {
        name: 'Countdown Timer',
        desc: 'Set a timer, watch it count down, get a chime when it is done.',
        href: '/tools/countdown-timer',
        tone: 't-orange',
        icon: ICON.countdownTimer,
        tag: 'Utility 22'
      },
      {
        name: 'World Clock',
        desc: 'Live clocks for cities around the world, plus a meeting planner.',
        href: '/tools/world-clock',
        tone: 't-sky',
        icon: ICON.worldClock,
        tag: 'Utility 23'
      },
      {
        name: 'Percentage Calculator',
        desc: 'Percent of, percent change, and what percent — all three in one.',
        href: '/tools/percentage-calculator',
        tone: 't-green',
        icon: ICON.percentageCalculator,
        tag: 'Utility 24'
      },
      {
        name: 'Date Calculator',
        desc: 'Days between dates, add or subtract days, and work out ages.',
        href: '/tools/date-calculator',
        tone: 't-purple',
        icon: ICON.dateCalculator,
        tag: 'Utility 25'
      },
      {
        name: 'Tip Splitter',
        desc: 'Split a bill with tip, per-person totals and a quick round-up.',
        href: '/tools/tip-splitter',
        tone: 't-pink',
        icon: ICON.tipSplitter,
        tag: 'Utility 26'
      },
      {
        name: 'Loan Calculator',
        desc: 'Monthly payments, total interest and a full amortisation table.',
        href: '/tools/loan-calculator',
        tone: 't-blue',
        icon: ICON.loanCalculator,
        tag: 'Utility 27'
      },
      {
        name: 'Notes Pad',
        desc: 'A plain notepad that saves to your browser and counts your words.',
        href: '/tools/notes',
        tone: 't-yellow',
        icon: ICON.notes,
        tag: 'Utility 28'
      },
      {
        name: 'Todo List',
        desc: 'A simple checklist that remembers itself — add, tick, clear done.',
        href: '/tools/todo',
        tone: 't-teal',
        icon: ICON.todo,
        tag: 'Utility 29'
      },
      {
        name: 'Gradient Generator',
        desc: 'Build CSS gradients, tweak the angle, and copy the code.',
        href: '/tools/gradient-generator',
        tone: 't-pink',
        icon: ICON.gradientGenerator,
        tag: 'Utility 30'
      }
    ],
    games: [
      {
        name: 'Tetris',
        desc: 'Stack the blocks, clear the lines, chase the high score.',
        href: '/games/tetris',
        tone: 't-red',
        icon: ICON.tetris,
        tag: 'Game 01'
      },
      {
        name: 'Pong',
        desc: 'Classic paddle duel against the CPU. First to 7 wins.',
        href: '/games/pong',
        tone: 't-sky',
        icon: ICON.pong,
        tag: 'Game 02'
      },
      {
        name: 'Breakout',
        desc: 'Smash every brick, keep the ball alive, clear the levels.',
        href: '/games/breakout',
        tone: 't-orange',
        icon: ICON.breakout,
        tag: 'Game 03'
      },
      {
        name: 'Snake',
        desc: 'Eat, grow, do not bite yourself. It speeds up as you go.',
        href: '/games/snake',
        tone: 't-green',
        icon: ICON.snake,
        tag: 'Game 04'
      },
      {
        name: 'Eaglercraft',
        desc: 'Minecraft in the browser — pick a client or a vanilla version.',
        href: '/games/eaglercraft',
        tone: 't-purple',
        icon: ICON.eaglercraft,
        tag: 'Game 05'
      },
      {
        name: 'Flappy',
        desc: 'Tap to flap, dodge the pipes, and see how far you get.',
        href: '/games/flappy',
        tone: 't-yellow',
        icon: ICON.flappy,
        tag: 'Game 06'
      },
      {
        name: '2048',
        desc: 'Slide the tiles, merge the numbers, and reach 2048.',
        href: '/games/2048',
        tone: 't-orange',
        icon: ICON['2048'],
        tag: 'Game 07'
      },
      {
        name: 'Memory Match',
        desc: 'Flip the cards and find every matching pair from memory.',
        href: '/games/memory-match',
        tone: 't-purple',
        icon: ICON.memoryMatch,
        tag: 'Game 08'
      },
      {
        name: 'Tic-Tac-Toe',
        desc: 'Three in a row against an unbeatable CPU — or a friend.',
        href: '/games/tic-tac-toe',
        tone: 't-sky',
        icon: ICON.ticTacToe,
        tag: 'Game 09'
      },
      {
        name: 'Connect Four',
        desc: 'Drop the discs, line up four, and outsmart the CPU.',
        href: '/games/connect-four',
        tone: 't-red',
        icon: ICON.connectFour,
        tag: 'Game 10'
      },
      {
        name: 'Minesweeper',
        desc: 'Flag the mines, clear the board, and beat the clock.',
        href: '/games/minesweeper',
        tone: 't-ink',
        icon: ICON.minesweeper,
        tag: 'Game 11'
      },
      {
        name: 'Simon Says',
        desc: 'Watch the colour sequence, then repeat it — it gets longer.',
        href: '/games/simon-says',
        tone: 't-green',
        icon: ICON.simonSays,
        tag: 'Game 12'
      },
      {
        name: 'Whack-a-Mole',
        desc: 'Moles pop up, you bop them. Sixty seconds of reflexes.',
        href: '/games/whack-a-mole',
        tone: 't-orange',
        icon: ICON.whackAMole,
        tag: 'Game 13'
      },
      {
        name: 'Asteroids',
        desc: 'Drift, shoot and dodge — clear the rocks before they hit you.',
        href: '/games/asteroids',
        tone: 't-blue',
        icon: ICON.asteroids,
        tag: 'Game 14'
      },
      {
        name: 'Jumper',
        desc: 'Bounce from platform to platform and climb as high as you can.',
        href: '/games/jumper',
        tone: 't-teal',
        icon: ICON.jumper,
        tag: 'Game 15'
      }
    ]
  };
})();
