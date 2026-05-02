<!-- Netlify status badge -->

[![Netlify Status](https://api.netlify.com/api/v1/badges/0da4984c-e76c-42e2-aa68-8fdc10cdca15/deploy-status)](https://app.netlify.com/sites/waelio/deploys)

# waelio.com

This repository contains a small Node-powered site that serves static files from `public/`, exposes a few lightweight APIs, and protects `/private` with Google Sign-In.

## Structure

- `public/`
  - `index.html` – UI for viewing npm package stats
  - `login.html` – Google sign-in page for `/private`
  - `private.html` – authenticated page
  - `app.js` – client logic (fetches npm registry + downloads APIs)
  - `styles.css` – styles
  - `manifest.webmanifest` – PWA manifest
  - `service-worker.js` – network-first for HTML/APIs, cache-first for static
- `server.mjs` – Node server for local development and auth/API routes
- `main.ts` / `main_test.ts` / `deno.json` – older Deno artifacts still in the repo
- `netlify.toml` – deploy configuration

## Run locally

```bash
npm run dev
```

Then open `http://localhost:3333`.

## Auth configuration

Copy `.env.example` to `.env` and set the auth values you want to use locally.

After changing `.env`, restart the dev server so the new auth values are loaded.

Required variables:

- `AUTH_SECRET` – secret used to sign session cookies
- `GOOGLE_CLIENT_ID` – Google OAuth 2.0 **Web application** client ID
- `ALLOWED_EMAILS` – comma-separated email allowlist for Google Sign-In

### Google Sign-In notes

If `GOOGLE_CLIENT_ID` is blank, the login page shows a Google configuration error and no alternate sign-in is available.

If Google shows `Error 401: invalid_client`, the configured `GOOGLE_CLIENT_ID` is not a real OAuth client for this app. Create or copy a valid **Web application** client ID from Google Cloud Console and make sure these origins are allowed:

- `http://localhost:3333`
- your production domain, if applicable

Also make sure the account you use is included in `ALLOWED_EMAILS`.

## Available routes

- `GET /api/add?a=NUMBER&b=NUMBER`
- `GET /api/npm?name=PACKAGE_NAME`
- `POST /api/auth/google`
- `GET /api/me`
- `GET /api/logout`

## Production

- Live site: https://waelio.com
- Netlify subdomain: https://waelio.netlify.app
- Deploys dashboard: https://app.netlify.com/sites/waelio/deploys

## Notes

- The app loads environment variables from a local `.env` file with a tiny built-in loader in `server.mjs`.
- The login page fetches `/api/config` to load the Google client ID at runtime.
- The npm metadata flow uses `https://registry.npmjs.org` and `https://api.npmjs.org`.
