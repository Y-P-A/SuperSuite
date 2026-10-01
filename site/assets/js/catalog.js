/* The single source of truth for what SuperSuite ships.
   Home, /utilities and /games all render from these lists. */
window.SS_CATALOG = {
  utilities: [
    {
      name: 'Calculator',
      desc: 'Fast flat calculator with keyboard support and a running tape.',
      href: '/tools/calculator',
      tone: 't-blue',
      glyph: '+',
      tag: 'Utility 01'
    },
    {
      name: 'Color Picker',
      desc: 'Pick a color, convert it, copy it, and grab tints and shades.',
      href: '/tools/color-picker',
      tone: 't-orange',
      glyph: '%',
      tag: 'Utility 02'
    },
    {
      name: 'QR Code Generator',
      desc: 'Scannable QR codes with custom size, colors and PNG/SVG download.',
      href: '/tools/qr-code',
      tone: 't-teal',
      glyph: 'QR',
      tag: 'Utility 03'
    },
    {
      name: 'Maps Explorer',
      desc: 'Search any place, switch map types, jump to your location.',
      href: '/tools/maps',
      tone: 't-green',
      glyph: 'M',
      tag: 'Utility 04'
    },
    {
      name: 'Crazy Text Filters',
      desc: 'Mock, uwu, script, bubble and more — turn plain text weird.',
      href: '/tools/text-filters',
      tone: 't-purple',
      glyph: 'Aa',
      tag: 'Utility 05'
    }
  ],
  games: [
    {
      name: 'Tetris',
      desc: 'Stack the blocks, clear the lines, chase the high score.',
      href: '/games/tetris',
      tone: 't-red',
      glyph: 'T',
      tag: 'Game 01'
    },
    {
      name: 'Pong',
      desc: 'Classic paddle duel against the CPU. First to 7 wins.',
      href: '/games/pong',
      tone: 't-sky',
      glyph: 'P',
      tag: 'Game 02'
    },
    {
      name: 'Breakout',
      desc: 'Smash every brick, keep the ball alive, clear the levels.',
      href: '/games/breakout',
      tone: 't-orange',
      glyph: 'B',
      tag: 'Game 03'
    },
    {
      name: 'Snake',
      desc: 'Eat, grow, do not bite yourself. It speeds up as you go.',
      href: '/games/snake',
      tone: 't-green',
      glyph: 'S',
      tag: 'Game 04'
    },
    {
      name: 'Eaglercraft',
      desc: 'Minecraft in the browser — four versions to choose from.',
      href: '/games/eaglercraft',
      tone: 't-purple',
      glyph: 'E',
      tag: 'Game 05'
    }
  ]
};
