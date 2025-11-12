<!-- Netlify status badge -->

[![Netlify Status](https://api.netlify.com/api/v1/badges/0da4984c-e76c-42e2-aa68-8fdc10cdca15/deploy-status)](https://app.netlify.com/sites/waelio/deploys)

# waelio.com (Deno static + PWA)

This repository contains a small Deno project that serves a static site from `public/` and a couple of demo APIs. The front-end fetches npm package metadata directly from the npm APIs and registers a service worker for basic offline support.

## Structure

- `public/`
  - `index.html` – UI for viewing npm package stats
  - `app.js` – client logic (fetches npm registry + downloads APIs)
  - `styles.css` – styles
  - `manifest.webmanifest` – PWA manifest
  - `service-worker.js` – network-first for HTML/APIs, cache-first for static
- `main.ts` – Deno server for local development; also exposes `/api/add` and `/api/npm`
- `main_test.ts` – tiny unit test for `add(a, b)`
- `deno.json` – tasks and import mappings
- `netlify.toml` – static deploy: publish `public/` with no build step

## Run locally

```bash
deno task dev
```

Then open http://localhost:8000

## Deploy (Netlify)

This site is configured for static deploys:

- Publish directory: `public/`
- Build command: none (handled by `netlify.toml`)

Deploy status: see badge above. Click through to Netlify for deploy details/logs.

## Production

- Live site: https://waelio.com
- Netlify subdomain: https://waelio.netlify.app
- Deploys dashboard: https://app.netlify.com/sites/waelio/deploys

## Notes

- The client fetches `https://registry.npmjs.org` and `https://api.npmjs.org` directly (CORS-enabled), so no server or Node build step is required for deployment.
