# @waelio packages

Single map of npm packages, local folders, and publish strategy.

## Auth (publish)

Publishing uses the **terminal only** — not Cursor’s embedded browser.

1. In **Chrome**: https://www.npmjs.com/settings/tokens → Generate **Publish** token.
2. In terminal: `npm config set //registry.npmjs.org/:_authToken=TOKEN` then `npm whoami`.
3. Per package: `npm run build` (if needed) → `npm pack --dry-run` → `npm publish --access public`.

Never paste tokens in chat.

## Package tiers

| Package | Folder | Tier | Notes |
|---------|--------|------|-------|
| `@waelio/ustore` | `../ustore` | npm-first | Hero library |
| `@waelio/utils` | `../utils` | npm-first | Modern utilities |
| `@waelio/data` | `../data` | npm-first | Schemas / local DB |
| `@waelio/messaging` | `../waelio-messaging` | npm-first | Fixed self-dep in 2.3.6 |
| `@waelio/cli` | `../cli` | npm-first | CLI; runtime deps in `dependencies` |
| `quasar-app-extension-waelio` | `../quasar-app-extension-waelio` | npm-first | Quasar extension |
| `waelio-utils` | `../waelio-utils` | legacy | Prefer `@waelio/utils` for new work |
| `@waelio/agent` | `../Agent/frontend` | hosted-first | Use Pages URL; npm for embedders |
| `@waelio/sync` | `../sync` | hosted-first | Worker app; `main` is not a library SDK |
| `@waelio/builder` | `../builder` | both | CLI on npm; repo metadata fixed 0.1.1 |
| `@waelio/negotiate` | `../negotiate/negotiate` | both | npm CLI wrapper |

## Wave 1 metadata fixes (2026-05-25)

- **messaging**: removed `@waelio/messaging` self-dependency → 2.3.6
- **cli**: moved `@waelio/ustore`, `waelio-utils` to `dependencies` → 0.1.14
- **data**: `files`, `publishConfig`, `prepublishOnly` → 1.0.7
- **builder**: `repository`, `homepage`, `bugs`, `author` → 0.1.1
- **utils**: `publishConfig.access`
- **ustore**: removed invalid `"public": "true"`; `README.md` in `files`

## Verify all packages

From `waelio.com`:

```bash
bash scripts/verify_packages.sh
```

## Do not use

`scripts/publish_all.sh` bulk-bumps and publishes without per-package checks.
