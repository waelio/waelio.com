import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'vite-plugin-md'
import WindiCSS from 'vite-plugin-windicss'
import { VitePWA } from 'vite-plugin-pwa'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Prism from 'markdown-it-prism'
import Inspect from 'vite-plugin-inspect'
import replace from '@rollup/plugin-replace'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from 'unocss/vite'
import LinkAttributes from 'markdown-it-link-attributes'


const markdownWrapperClasses = 'prose prose-sm m-auto text-left'

export default defineConfig({
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
      '~/': `${path.resolve(__dirname, 'src')}/`,
      'pub/': `${path.resolve(__dirname, 'public')}/`,
      'src/': `${path.resolve(__dirname, 'src')}/`,
      'audio/': `${path.resolve(__dirname, 'src')}/audio/`,
      'imgs/': `${path.resolve(__dirname, 'src')}/images/`,
      'components/': `${path.resolve(__dirname, 'src/components')}/`,
      'pages/': `${path.resolve(__dirname, 'src/pages')}/`,
      'store/': `${path.resolve(__dirname, 'src/store')}/`,
      'contracts/': `${path.resolve(__dirname, '/smart_contract')}/`,
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],

    }),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    }),
    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
    }),
    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@vueuse/head',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),
    // https://github.com/antfu/vite-plugin-md
    Markdown({
      wrapperClasses: markdownWrapperClasses,
      headEnabled: true,
      markdownItSetup(md) {
        // https://prismjs.com/
        md.use(Prism)
        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })
      },
    }),
    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: 'src/components.d.ts',
    }),
    Inspect({
      // change this to enable inspect for debugging
      enabled: false,
    }),
    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      safelist: 'prose prose-sm m-auto text-left',
    }),
    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'safari-pinned-tab.svg'],
      // start_url: '/?source=pwa',
      display: 'standalone',
      name: 'Waelio.com',
      base: '/',
      short_name: 'Waelio',
      background_color: '#3E4EB8',
      theme_color: '#2F3BA2',
      mode: 'production',
      // strategies: 'generateSW',
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
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      '@vueuse/head',
      'feathers-pinia',
      'waelio-utils',
    ],
    exclude: [
      'vue-demi',
      '@feathers',
      '@quasar/app',
      'quasar',
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://api.ipify.org?format=json',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/ipdata': {
        target: 'http://api.ipdata.co',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: path => path.replace(/^\/ipdata/, ''),
      },
      '/data_layer': {
        target: 'http://api.currencylayer.com',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: path => path.replace(/^\/data_layer/, ''),
      }
    }
  }
})
