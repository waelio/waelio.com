# waelio.com Copilot Instructions

## Architecture snapshot

- Deno `main.ts` is both the HTTP server and API aggregator; it serves `public/` assets, proxies npm API calls, and reads local Quran JSON files.
- Static PWA lives in `public/` (multiple HTML entry points, shared `styles.css`, `theme.js`, `consent.js`, `ga.js`, `app.js`, `service-worker.js`). Keep UI changes isolated to this folder or the `src/` TypeScript sources that generate it.
- Local Quran data sits in `data/chapters/*.json` and `data/editions/*.json`; APIs assume files are present and lowercase language codes.

## Backend patterns (`main.ts`)

- Requests flow through a single handler that uses `fetchJson`, `contentType`, and `json()` helpers; reuse these when adding endpoints so CORS (`access-control-allow-*`) stays consistent.
- Current endpoints: `/api/add`, `/api/npm` & `/api/pkg`, `/api/downloads`, `/api/search`, `/api/editions`, `/api/chapters`, `/api/health`, `/api/version`. Document new routes inside `public/api.html` when they go live.
- `API_VERSION` drives both `/api/health` and `/api/version`; bump it in one place to propagate everywhere.
- Static files resolve by prefixing `public` and falling back to `/index.html`. Prefer adding new pages under `public/` rather than special-casing in the handler.
- When touching local JSON responses, use `Deno.readTextFile` + `JSON.parse` and feed the result through the `json()` helper to keep headers identical.

## Frontend + PWA

- Author npm-wall logic in `src/app.ts` and run `deno task build:app` (or `deno task build`) to regenerate `public/app.js`; do not edit the bundled file directly.
- `src/ga.ts` compiles to `public/ga.js` and only runs after `consent.js` dispatches `consent:granted`; keep that event contract intact when changing analytics.
- `public/service-worker.js` precaches the `APP_SHELL` array and uses network-first for HTML/API and cache-first for other assets. Update `CACHE_NAME` + `ASSET_VERSION` together when you add/remove shell entries.
- Dark mode toggling relies on `document.documentElement.dataset.theme` plus localStorage key `theme`; match that contract when tweaking CSS or `theme.js`.

## Data sources

- `/api/editions` reads `editions/{lang}.json`; `/api/chapters` reads `data/chapters/{lang}.json` (lang comes from query string or URL). Normalize new language codes to lowercase filenames.
- `src/types.quran.d.ts` already defines Quran-focused interfaces; import from there whenever adding typed helpers for the local JSON payloads.
- Frontend requests npm registry + downloads APIs straight from the browser, so keep calls anonymous and mindful of CORS limits (no server proxy required for those routes).

## Workflows & tooling

- `deno task dev` runs the server with `--watch --allow-net --allow-read`; `deno task start` is the same without watch; `deno task test` runs the Deno unit tests.
- `deno task build` bundles both `src/app.ts` and `src/ga.ts` to `public/`; run it before committing frontend changes or deploying.
- Deployment is static: Netlify publishes `public/`. The GitHub Action `.github/workflows/netlify-deploy.yml` installs `netlify-cli` and runs `netlify deploy --dir=public --prod` using the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets.

## Conventions & tips

- Tests live beside their code (see `main_test.ts`); keep them lightweight with `@std/assert` and no additional permissions.
- Static assets append `?v=20251113` (or similar) in HTML and `service-worker.js`; update every reference plus `ASSET_VERSION` when revving an asset.
- GA IDs can be injected via `<meta name="ga-id">` or `public/ga.json` (fetched with `cache: 'no-store'`); never bake real IDs into source.
- `.env.example` documents optional `SITE_*` values; copy it to `.env` for local Netlify tooling but never rely on it in runtime code.
- Follow the existing error pattern: surface upstream failures as `{ error, detail }` JSON via the shared helper so the UI and docs remain consistent.
