# 📦 @waelio Packages - Maintenance & Tracking List

This file tracks the status, purpose, and download monitoring of all `@waelio` packages in the workspace.

## 🕒 Daily Monitoring Schedule
A recurring cron task has been scheduled to run every day:
*   **Action:** Run `node track-downloads.js`
*   **Purpose:** Fetch and review the 3-week range download statistics to detect publish spikes, organic traffic levels, and trend changes.

---

## 📦 Monitored Packages List

| # | Package Name | Scope / Role | Repository Location | Current Status |
|---|---|---|---|---|
| 1 | `waelio-utils` | Legacy / General utility library | `waelio.com` | Monitored |
| 2 | `@waelio/utils` | General modern ESM utilities | `waelio.com` | Monitored |
| 3 | `@waelio/ustore` | Local storage state manager | `waelio.com` | Monitored |
| 4 | `quasar-app-extension-waelio` | Quasar framework integration | `waelio.com` | Monitored |
| 5 | `@waelio/agent` | Local AI agent chat frontend PWA | `builder/` | Active |
| 6 | `@waelio/messaging` | Custom event and message passing broker | `waelio.com` | Monitored |
| 7 | `@waelio/cli` | Workspace scaffold/runner CLI | `waelio.com` | Monitored |
| 8 | `@waelio/sync` | Live sync database utility layer | `waelio.com` | Monitored |
| 9 | `@waelio/data` | Shared data structure schemas | `waelio.com` | Monitored |
| 10 | `@waelio/builder` | Project blueprints scaffold and AI Express server | `builder/` | Active |
| 11 | `@waelio/negotiate` | Peer connection negotiation broker | `waelio.com` | Monitored |
| 12 | `@waelio/realdb` | Reactive local database layer | `realdb/` | Active |

---

## 🚀 How to Run the Tracker manually

Navigate to the `waelio.com` root folder and execute:
```bash
node track-downloads.js
```
This runs the lightweight tracking script that queries the live NPM registry for historical download range logs.
