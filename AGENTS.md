# SuperSuite

Static site — flat, geometric, 2015-flavoured. Hub page plus ten utilities and five
games. No build step, no framework, no backend: plain HTML, one stylesheet, and plain
scripts served by nginx.

## Layout

```
site/
  index.html            hub (hero + both catalogs)
  utilities/index.html  utilities listing        (served at /utilities/)
  games/index.html      games listing            (served at /games/)
  404.html
  nginx.conf            mounted as /etc/nginx/conf.d/default.conf
  assets/css/style.css  the whole design system (tokens, shell, tools, games)
  assets/js/site.js     header/footer shell, toast, clipboard, download helpers
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
- **Eaglercraft** frames builds from `gx-launcher.github.io/game/…` — six clients (Astra, Astra 2,
  Eclipse, Resent, Pixel, Larp) plus vanilla 1.5.2 / 1.8.8 / 1.12.2 / 1.16.5. Astra Client 1.8.8
  is the default. The same files on `raw.githack.com` **cannot** be framed — that host answers
  with `x-frame-options: SAMEORIGIN` (and 403s datacenter IPs), so the GitHub Pages mirror is the
  one to use. Nothing is self-hosted, and there is no "open in new tab" fallback by design.
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
- No secrets, database, or external services.

## Verifying changes (no browser needed)

The container has no test runner; these checks cover most of it:

```bash
# every route answers
for p in / /utilities/ /games/ /tools/calculator /tools/qr-code /tools/image-converter \
         /tools/unit-converter /tools/password-generator /tools/json-formatter /tools/encoder \
         /games/tetris /games/eaglercraft; do
  printf '%-28s %s\n' "$p" "$(curl -sS -o /dev/null -w '%{http_code}' http://localhost:3000$p)"; done
```

- Script syntax (host has no node; run it in a container):
  `docker run --rm -v "$PWD":/w -w /w node:22-alpine sh -c 'for f in $(find site -name "*.js"); do node --check $f; done'`
- The scripts are plain scripts, so they can be exercised headlessly with a small DOM stub
  (element ids, key events, `requestAnimationFrame`) — that is how the calculator maths, the
  text filters, the QR canvas geometry and all four canvas games were checked, since no
  browser tab was available.
- QR output is genuinely scannable: render the module matrix to a PBM (same geometry as
  `assets/js/qr-code.js`) and decode it with `zxing-cpp` / `pyzbar` in a throwaway container.
- A PDF written by the image converter is worth checking with a real tool — `pdftoppm` (poppler)
  or `pdfinfo` in a throwaway container — since a bad xref still opens in lenient viewers.
