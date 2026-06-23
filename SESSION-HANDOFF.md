# Session handoff — waelio.com + peace2074.com

Saved: 2026-06-23. Continue from **waelio.com** workspace.

## User context

- Severe vision impairment — keep replies **short**. No long instructions.
- Do **not** ask user to navigate files or run commands manually when avoidable.
- **peace2074.com** iOS/TV apps load the **live site** — web deploy = what users see (no Xcode rebuild for web fixes).

---

## peace2074.com — done & live

| Fix | Status |
|-----|--------|
| Offline recitation downloads not persisting | **Live** — settings reload no longer wipes audio; metadata verified against cache |
| Stats API `GET /api/stats/offline-recitation` | **Live** — returns offline + Quran read counts (MongoDB when available) |
| Ask PEACE AI white field in dark mode | **Live** — `src/views/Home.vue` dark styles for `q-input` |
| Deploy | Manual: `pnpm run build:cf` + `wrangler pages deploy apps/nitro-api/dist --project-name peace2074-com --branch one` (Git **not** connected to Cloudflare) |

Latest pushed branch: `one`.

---

## waelio.com — done & live

| Item | Status |
|------|--------|
| **peace2074.com** package card real numbers | **Live** — shows big **XXX/wk total** (npm weekly for realdb, messaging, ustore, sync + optional app stats) |
| Loading stuck on peace2074 card | **Fixed** — 2.5s timeout on peace2074 API + single cached fetch |
| `@waelio/realdb` npm total | Includes peace2074 weekly activity |
| `@waelio/chat` + **peace2074.com** pinned on homepage | Done (no duplicate `quran` entry) |
| Deploy | `npm run build:web` + `wrangler pages deploy public --project-name waelio-com --branch main --commit-dirty=true` |
| Cache bust | `public/index.html` → `app.js?v=20260623c` (bump when redeploying) |

Key files:

- `src/peace2074-stats.ts` — npm + peace2074 API stats (cached)
- `src/app.tsx` — loads stats for peace2074.com card and realdb
- `src/package-grid-card.tsx` — big stat on peace2074 card
- `src/chat.tsx` — `/chat` app

---

## Tomorrow / pending (waelio.com)

1. **Other package cards** — user wants all packages up-to-date (numbers, copy, static pages).
2. **Git sync** — local `default` branch is **ahead 2, behind 522** vs `origin/Default`; many uncommitted files (chat, packages, stats tweaks). Commit + push when user asks.
3. **Do not** re-add duplicate **quran** package (same URL as peace2074.com).

---

## Numbers explained (for user)

- **Google Analytics (PeaceSite / MAIN)** = page visits — different metric.
- **waelio.com peace2074 “/wk total”** = real **npm** downloads of packages peace2074 uses (~313/wk) + app stats when API responds.
- **Do not delete** GA properties; no new GA instance needed.

---

## Deploy commands (copy-paste)

**waelio.com:**

```bash
cd /Users/waelio/Code/GitHub/waelio/waelio.com
npm run build:web
npx wrangler pages deploy public --project-name waelio-com --branch main --commit-dirty=true
```

**peace2074.com:**

```bash
cd /Users/waelio/Code/GitHub/peace2074/peace2074.com
pnpm run build:cf
npx wrangler pages deploy apps/nitro-api/dist --project-name peace2074-com --branch one --commit-dirty=true
```

---

## Conversation transcript

Cursor transcript ID: `7c814082-6b8f-4df4-8a72-c74b689f413e`
