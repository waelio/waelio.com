Deno server for waelio.com

Quick start

1. Install Deno (https://deno.land/) — recommended to use the official installer or brew:

```bash
# macOS (Homebrew)
brew install deno

# or via script
curl -fsSL https://deno.land/x/install/install.sh | sh
```

2. Development (watch mode):

```bash
deno task dev
# or
deno run --watch --allow-net --allow-read main.ts
```

3. Start (production):

```bash
deno task start
# or
deno run --allow-net --allow-read main.ts
```

API endpoints

- GET /api/editions?lang=en -> returns `editions/{lang}.json` (default `en`)
- GET /api/chapters or /api/chapters/:lang -> returns `data/chapters/{lang}.json`
- Static site served from `public/`

Notes

- `deno.json` already contains tasks for `dev` and `start`.
- The Deno server reads local JSON files and returns JSON responses with CORS headers.
