# waelio.com (Deno + Minimal PWA)

This repository contains a simple Deno application exposing an `add(a,b)`
function, an API endpoint, and a minimal progressive web app (PWA) interface.

## Structure

- `main.ts` – HTTP server (port 8000) serving HTML UI, `/api/add`, in‑memory
  `manifest.webmanifest`, and `service-worker.js`.
- `main_test.ts` – Unit test for `add` using Deno standard assertions.
- `deno.json` – Task definitions (dev/start/test) and import mappings.

## Run

```bash
deno run --allow-net main.ts      # one-off run
deno task dev                     # watch mode with network permissions
deno test                         # run tests
```

Server will listen on: `http://localhost:8000`

## API

`GET /api/add?a=NUMBER&b=NUMBER` → `{ "result": number }`

## PWA

Served inline: `manifest.webmanifest` & `service-worker.js` (network-first for
`/api/` paths, cache-first for shell). After load, the service worker caches `/`
and the manifest for offline use.

## Why Deno here?

No Node toolchain required. Direct TypeScript execution, built-in test runner,
secure permission model (`--allow-net`).

## Next Ideas

Add more routes, persist data, integrate a DB, or migrate to a framework (Fresh
/ Hono / Astro) if structure grows.

## License

MIT
