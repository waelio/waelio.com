# waelio.com (Open Source)

[![built with nuxt][nuxt-src]][nuxt-href]

## Quick Start

```bash
pnpm install
pnpm dev --port 3000
```

Production site: <a href="https://waelio.com" target="_blank" rel="noopener">https://waelio.com</a><br>
Stack: Nuxt 4 + Tailwind v4 + Shadcn Vue + Pinia + VueUse
You can change the app settings in `app.config.ts` file.
If you want to change app settings, you have to clear cookie 'app_settings' first.

```
export default defineAppConfig({
  appSettings: {
    sidebar: {
      collapsible: 'offcanvas', // 'offcanvas' | 'icon' | 'none'
      side: 'left', // 'left' | 'right'
      variant: 'inset', // 'sidebar' | 'floating' | 'inset'
    },
    theme: {
      color: 'default', // 'default' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'yellow' | 'rose'
      type: 'scaled', // 'default' | 'mono' | 'scaled'
    }
  },
})
```

## Analytics (GA4)

Google Analytics 4 is supported via a small Nuxt client plugin. Set your Measurement ID using a public env var:

1. Copy `.env.example` to `.env` and set your ID

```
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

2. The GA script will only load in production builds when the ID is set. For local testing, you can build and preview:

```bash
pnpm build && pnpm preview
```

## Contributing

1. Clone this repository.
2. Install dependencies `pnpm install`.
3. Use `pnpm run dev` to start dev server.

## Credits

- [Nuxt.js](https://nuxtjs.org/)
- [Shadcn Vue](https://shadcn-vue.com/)
- [TailwindCSS](https://tailwindcss.com/)

## License

MIT. Original template © 2024 Dian Pratama. Modifications © 2025 Wael Wahbeh.

[nuxt-src]: https://img.shields.io/badge/Built%20With%20Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com/

## Deploy

This repo is configured for Netlify static deploys via `netlify.toml`.

- Build command: `pnpm install --frozen-lockfile --prefer-offline && pnpm generate`
- Publish directory: `dist`
- Node: `NODE_VERSION=22` (Netlify will try Node 22; CI allows >=20)

Netlify UI steps (if connecting fresh):

1. Create a site from Git and select `github.com/waelio/waelio.com`.
2. Choose branch `Default`.
3. Ensure the build and publish settings match above or leave blank (netlify.toml takes precedence).
4. Optional env vars: `NUXT_PUBLIC_GA_ID`, `PNPM_VERSION=10.10.0`.

Note: Any Vercel preview links from the original template (e.g., social cards) are not used here.
