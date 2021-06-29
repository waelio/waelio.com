import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import ViteIcons, { ViteIconsResolver } from 'vite-plugin-icons'
import ViteComponents from 'vite-plugin-components'
import Markdown from 'vite-plugin-md'
import WindiCSS from 'vite-plugin-windicss'
import { VitePWA } from 'vite-plugin-pwa'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Prism from 'markdown-it-prism'
import replace from '@rollup/plugin-replace'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      'src/': `${path.resolve(__dirname, 'src')}/`,
      'store/': `${path.resolve(__dirname, 'src/store')}/`,
      'components/': `${path.resolve(__dirname, 'src/components')}/`,
      'pages/': `${path.resolve(__dirname, 'src/pages')}/`,
    },
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
      ssr: !!process.env.VITE_SSG,

    }),
    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/antfu/vite-plugin-md
    Markdown({
      wrapperClasses: 'prose prose-sm m-auto text-left',
      headEnabled: true,
      markdownItSetup(md) {
        // https://prismjs.com/
        md.use(Prism)
      },
    }),

    // https://github.com/antfu/vite-plugin-components
    ViteComponents({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],

      // allow auto import and register components used in markdown
      customLoaderMatcher: id => id.endsWith('.md'),

      globalComponentsDeclaration: true,

      // auto import icons
      customComponentResolvers: [
        // https://github.com/antfu/vite-plugin-icons
        ViteIconsResolver({
          componentPrefix: '',
          enabledCollections: ['carbon'],
        }),
      ],
    }),

    // https://github.com/antfu/vite-plugin-icons
    ViteIcons(),

    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      safelist: 'prose prose-sm m-auto text-left',
    }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      start_url: '/?source=pwa',
      display: 'standalone',
      name: 'Waelio.com',
      base: '/',
      short_name: 'Waelio',
      background_color: '#3E4EB8',
      theme_color: '#2F3BA2',
      mode: 'production',
      registerType: 'autoUpdate',
      // strategies: 'generateSW',
      includeAssets: ['favicon.svg', 'robots.txt', 'safari-pinned-tab.svg'],
      description: 'Personal Portfolio Website with current projects, links to previous projects. Contact US page as well as support page for other online projects. Welcome Friends.',
      manifest: {
        name: 'Waelio.com',
        short_name: 'Waelio',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        files: [

        ],
      },
      workbox: {
        // globPatterns: ['images/*.png'],
      },
    }),
    replace({
      __DATE__: new Date().toISOString(),
      preventAssignment: true,
    }),

    // https://github.com/intlify/vite-plugin-vue-i18n
    VueI18n({
      include: [path.resolve(__dirname, 'locales/**')],
    }),
  ],
  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
    ],
    exclude: [
      'vue-demi',
      'feathers-pinia'      
    ],
  },
})
