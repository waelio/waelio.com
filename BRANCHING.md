# Branch policy — one name everywhere

All **waelio** Git repositories use a single default branch:

## `default`

No `main`, `master`, or `Default` for day-to-day work. One branch = less confusion between sites, packages, and UI.

| Repo | Folder | Branch |
|------|--------|--------|
| waelio.com | `waelio.com` | `default` |
| @waelio/cli | `cli` | `default` |
| @waelio/data | `data` | `default` |
| @waelio/ustore | `ustore` | `default` |
| @waelio/utils | `utils` | `default` |
| @waelio/messaging | `waelio-messaging` | `default` |
| @waelio/builder | `builder` | `default` |
| @waelio/sync | `sync` | `default` |
| waelio-utils | `waelio-utils` | `default` |
| quasar-app-extension-waelio | `quasar-app-extension-waelio` | `default` |
| @waelio/agent | `Agent` | `default` |

## waelio.com: code + UI on the same branch

`default` holds everything:

- **UI** — `src/`, built to `public/`
- **API / workers** — `functions/`
- **Docs / scripts** — `PACKAGES.md`, `scripts/`

You do not need a separate branch for UI vs backend.

## Cloudflare Pages note

`package.json` deploy may use `--branch main` — that is a **Cloudflare deployment label**, not this Git branch. Git stays `default`.

## After renaming on GitHub

For each repo: **Settings → General → Default branch → `default`**, then delete old `main` / `master` / `Default` on the remote when safe.
