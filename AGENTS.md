# SuperSuite

Static "coming soon" landing page. The repo previously held only a README — there is
no application framework, build step, or backend yet.

## Layout

- `site/index.html` — the landing page (self-contained HTML + CSS, no build step).
- `site/nginx.conf` — nginx server block used as `/etc/nginx/conf.d/default.conf`.
- `docker-compose.base44.yml` — dev environment: nginx serving the bind-mounted `site/`
  directory on host port 3000.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d
```

Verify: `curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/` → `200`.

## Notes / quirks

- nginx runs on a plain base image with the source bind-mounted read-only, so page edits
  are picked up immediately with no rebuild. There is no file watcher, so after editing
  `site/` the browser needs a refresh.
- `site/nginx.conf` is mounted as a **file**; nginx only re-reads it on start, so after
  changing it run `docker compose -f docker-compose.base44.yml restart web`.
- The page is served for every path (`try_files ... /index.html`) and nginx's default
  server accepts any `Host`, which is required for the Base44 preview proxy.
- No secrets, database, or external services are involved.
