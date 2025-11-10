![nuxt-shadcn-dashboard-social-card](https://nuxt-shadcn-dashboard.vercel.app/social-card.png)

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
