# SuperSuite

Static site — flat, geometric hub with a **Rewind** theme system. Thirty-five utilities and
twenty games. No build step, no framework, no backend: plain HTML, a stylesheet per concern,
and plain scripts served by nginx.

## Layout

```
site/
  index.html            hub (hero + both catalogs)
  utilities/index.html  utilities listing        (served at /utilities/)
  games/index.html      games listing            (served at /games/)
  404.html
  nginx.conf            mounted as /etc/nginx/conf.d/default.conf
  assets/css/style.css  the design system: tokens, shell, catalog, tools, games
  assets/css/rewind.css era themes (2010s/2000s/1990s/2020s), every user setting,
                        and the settings drawer
  assets/css/music-lab.css  loaded only by /tools/music-lab — the note grid and the
                        instrument cards, built from the same tokens so eras restyle it
  assets/js/rewind.js   settings STORE — loaded in <head> on every page so the chosen
                        era paints before the body (no flash of the wrong decade)
  assets/js/settings.js settings UI — gear button + drawer; injected by site.js
  assets/js/site.js     header/footer shell, toast, clipboard, download helpers,
                        catalog rendering, and the data-page tool/game shell
  assets/js/catalog.js  SS_CATALOG — single source of truth for both listings,
                        including each card's inline SVG logo (`icon`)
  assets/js/*.js        one script per utility
  assets/js/games/      common.js (loop, input, overlay, high scores) + one per game
  vendor/qrcode.js      MIT QR encoder (Kazuhiko Arase) — vendored, no CDN at runtime
  vendor/pdf.min.js     pdf.js 3.11.174 legacy UMD build + its worker, both vendored
                        (Apache-2.0) and used only by the image converter
  vendor/               keep third-party files here, never in assets/js
```

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/        # 200
```

## Rewind & settings

- `rewind.js` runs in `<head>` and writes `data-rewind`, `data-density`, `data-corners`,
  `data-scale`, `data-cards`, `data-width` plus `ss-glow` / `ss-scanlines` /
  `ss-motion-off` / `ss-opaque` onto `<html>`. State lives in `localStorage` under
  `supersuite.settings`. **Every page must load `rewind.css` AND `rewind.js`** — a page
  missing them silently ignores the user's theme.
- `settings.js` is **not** in any page's markup: `site.js` appends it at mount. It builds
  the drawer and the gear button (which it injects into `.topbar__inner`).
- Era blocks in `rewind.css` are scoped to `html[data-rewind="…"]`; the base sheet is the
  `classic` 2015 look and stays untouched. Shared component rules are scoped with
  `html:not([data-rewind="classic"])`. The settings blocks (density/corners/…) sit at the
  END of the file so they win over the era defaults.
- `--accent` is only defined per era; a user-picked accent is set inline on
  `documentElement`, which outranks the stylesheet. Always reference it as
  `var(--accent, <fallback>)` so `classic` (no `--accent`) still renders.
- Every era redefines the design tokens (`--surface`, `--ink`, `--line`, …), so custom CSS
  that sticks to tokens is themed for free. Anything hard-coding a colour is not.

## Page shell for new tools and games

New tool/game pages do not repeat the back link or the panel header. Put
`data-page="/tools/slug"` on `<body>` (optional `data-note="…"` to override the blurb) and
`site.js` builds both from the catalog entry. Such pages must load `catalog.js` before
`site.js`. Older pages keep hand-written markup and have no `data-page`; both styles coexist.

## Quirks worth knowing

- **Clean URLs** come from nginx `try_files $uri $uri.html $uri/ =404`, so `/tools/calculator`
  serves `tools/calculator.html`. Never create a directory and a same-named `.html` sibling:
  `/games` and `/utilities` are directories, so their listings are `index.html` files and the
  nav links to `/utilities/` and `/games/` (a bare `/games` still 301-redirects).
- **nginx reads `nginx.conf` only at startup.** After editing it:
  `docker compose -f docker-compose.base44.yml restart web`. Page/script/CSS edits need no
  restart — the `site/` directory is bind-mounted read-only, and `Cache-Control: no-store`
  keeps the browser honest. There is no file watcher, so refresh the preview after edits.
- **Google Maps** is embedded keyless via `https://www.google.com/maps?q=…&t=…&z=…&output=embed`.
  Do not add an API key; keep the `output=embed` parameter.
- **Eaglercraft** frames builds from `gx-launcher.github.io/game/…`. The mirror has **no
  directory listing** (the root 404s) — probe candidate paths with `curl` before adding one.
  Verified builds: clients (Astra, Astra 2, Eclipse, Resent, Pixel, Larp) plus vanilla
  1.5.2 (JS only) and 1.8.8 / 1.12.2 / 1.16.5 in **both** JS and WASM. The same files on
  `raw.githack.com` **cannot** be framed — that host answers with `x-frame-options: SAMEORIGIN`
  (and 403s datacenter IPs). Nothing is self-hosted, and there is no "open in new tab"
  fallback by design.
- **Music Lab** (`assets/js/music-lab.js`) is the only tool with real state. A song is
  `{ bpm, bars, metronome, layers[] }` and each layer is
  `{ instrument, volume, octave, muted, solo, notes:Set("row:step") }`. Sound is synthesised
  live through the Web Audio API — no samples, no vendored audio. Notes are scheduled ahead
  of the clock (25 ms tick, 120 ms lookahead) and the playhead is driven by a queue of
  `[step, ctxTime]`, so changing tempo mid-playback never desyncs the highlight. Grid edits
  push JSON snapshots onto a 25-deep undo stack. Cells listen for `pointerdown`/`pointermove`
  rather than `click`, so notes can be painted by dragging. **Every envelope ramps to 0.0001,
  never to 0** — `exponentialRampToValueAtTime(0)` throws and would silence that instrument.
  The grid is `8 rows × bars × 8 steps`; growing a bar is just `bars += 1`, capped at 64.
- **Image Converter** writes PDFs by hand (`buildPdf` in `assets/js/image-converter.js`): every
  page is one JPEG stored with `/Filter /DCTDecode`, laid out on A4 by aspect ratio. The xref
  offsets and `/Length` values must stay byte-accurate, and the byte arrays must be concatenated
  as `Uint8Array` chunks — building the file as a JS string corrupts bytes above 0x7f. Reading
  PDFs back uses the vendored pdf.js, whose worker is loaded from `/vendor/pdf.worker.min.js`.
- **QR generation** picks the smallest encoding version by looping versions 1-40. The encoder
  throws *plain strings* (not `Error` objects), so any overflow check must read both shapes —
  `String(err.message)` alone silently breaks generation.
- Games share `assets/js/games/common.js`: `SS.createLoop`, `SS.createKeys`, `SS.bindPad`,
  `SS.createOverlay`, `SS.best`. Pause/restart keys must be read *outside* the
  "is the game running" guard, otherwise `P` can pause but never un-pause.
- Every game page is canvas-first and uses the shared `.stage` / `.hud` / `.pad` classes, so
  new games need no new CSS. Canvas coordinates must be scaled by the element's box
  (`(clientX - rect.left) * (canvas.width / rect.width)`) because `.stage canvas` is fluid.
- **Tic-Tac-Toe** scores positions from the CPU's side (O maximises, X minimises, `ply`
  prefers faster wins). Getting this inverted makes the "unbeatable" CPU deliberately lose.
  **Reversi** is the same trap with a different sign: `search` maximises for the CPU and
  minimises for the player, and the evaluation is from the CPU's side. Corner weights dominate
  on purpose; mobility and disc counts only break ties.
- No secrets, database, or external services.

## Verifying changes (no browser needed)

The container has no test runner; these checks cover most of it:

```bash
# every page answers (200), and 404 still 404s
for f in $(cd site && find . -name '*.html' | sed 's|^\./||;s|\.html$||'); do
  case "$f" in index) p="/";; utilities/index) p="/utilities/";; games/index) p="/games/";;
    *) p="/$f";; esac
  printf '%-30s %s\n' "$p" "$(curl -sS -o /dev/null -w '%{http_code}' http://localhost:3000$p)"; done
```

- Script syntax (host has no node; run it in a container):
  `docker run --rm -v "$PWD":/w -w /w node:22-alpine sh -c 'for f in $(find site -name "*.js"); do node --check $f; done'`
- **Catalog + theme wiring**, headlessly (no browser needed) — this is the fastest way to
  catch a page that forgot `rewind.css`/`rewind.js`, or a catalog entry with a dead href:
  load `catalog.js` with a `window` stub and assert 35 utilities / 20 games and that
  `site/<href>.html` exists; eval `rewind.js` with a small `document`/`localStorage` stub and
  assert `rw.set('rewind','1990s')` updates `data-rewind` and persists.
- The scripts are plain scripts, so they can be exercised headlessly with a small DOM stub
  (element ids, key events, `requestAnimationFrame`). That is how the calculator maths, the
  text filters, the QR canvas geometry, the 2048 merge rules and the tic-tac-toe minimax
  (3000 random games, CPU never loses) were checked.
- **Reach the insides of an IIFE** by appending an export before its closing `})();`:
  read the file, `src.replace(/\}\)\(\);\s*$/, 'globalThis.__t = { … };\n})();')`, and run it
  with `vm.runInContext` over a stub sandbox. That is how the Reversi search (40 games against
  a random player — no illegal moves, CPU never loses) and every Music Lab instrument voice
  were checked. A Web Audio stub whose `exponentialRampToValueAtTime` *throws on 0* is worth
  the ten lines: it catches the silent-synth bug above.
- QR output is genuinely scannable: render the module matrix to a PBM (same geometry as
  `assets/js/qr-code.js`) and decode it with `zxing-cpp` / `pyzbar` in a throwaway container.
- A PDF written by the image converter is worth checking with a real tool — `pdftoppm` (poppler)
  or `pdfinfo` in a throwaway container — since a bad xref still opens in lenient viewers.
