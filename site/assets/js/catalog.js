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
    )
  };

  window.SS_CATALOG = {
    utilities: [
      {
        name: 'Calculator',
        desc: 'Fast flat calculator with keyboard support and a running tape.',
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
        desc: 'Scannable QR codes with custom size, colors and PNG/SVG download.',
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
        desc: 'PNG, JPG and PDF both ways — images to PDF, PDF pages to images.',
        href: '/tools/image-converter',
        tone: 't-pink',
        icon: ICON.imageConverter,
        tag: 'Utility 06'
      },
      {
        name: 'Unit Converter',
        desc: 'Length, weight, temperature, data and more — converts as you type.',
        href: '/tools/unit-converter',
        tone: 't-sky',
        icon: ICON.unitConverter,
        tag: 'Utility 07'
      },
      {
        name: 'Password Generator',
        desc: 'Strong random passwords, made in your browser and never sent.',
        href: '/tools/password-generator',
        tone: 't-red',
        icon: ICON.password,
        tag: 'Utility 08'
      },
      {
        name: 'JSON Formatter',
        desc: 'Paste messy JSON — tidy it, minify it, check it, copy it.',
        href: '/tools/json-formatter',
        tone: 't-yellow',
        icon: ICON.json,
        tag: 'Utility 09'
      },
      {
        name: 'Encoder / Decoder',
        desc: 'Base64, URL, HTML entities and ROT13 — encoded and decoded.',
        href: '/tools/encoder',
        tone: 't-ink',
        icon: ICON.encoder,
        tag: 'Utility 10'
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
      }
    ]
  };
})();
