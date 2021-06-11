<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { isDark, toggleDark } from '~/logic'

const { t, availableLocales, locale } = useI18n()

const toggleLocales = () => {
  const locales = availableLocales
  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
}
</script>

<template>
  <nav class="text-xl mt-6">
    <router-link class="icon-btn mx-2" to="/" :title="t('button.home')">
      <carbon-campsite />
    </router-link>

    <a class="icon-btn mx-2" :title="t('button.toggle_dark')" @click="toggleDark">
      <carbon-moon v-if="isDark" />
      <carbon-sun v-else />
    </a>

    <a class="icon-btn mx-2" :title="t('button.toggle_langs')" @click="toggleLocales">
      <carbon-language />
    </a>

    <router-link class="icon-btn mx-2" to="/about" :title="t('button.about')">
      <carbon-face-cool />
    </router-link>
    <a class="icon-btn mx-2" rel="noreferrer" href="https://github.com/waelio" target="_blank" title="Waelio - GitHub">
      <carbon-logo-github />
    </a>

    <router-link class="icon-btn mx-2" to="/contact" :title="t('button.Contact')">
      <carbon-email />
    </router-link>

    <router-link class="icon-btn mx-2" to="/privacy" :title="t('button.Privacy')">
      <carbon-virtual-private-cloud />
    </router-link>

    <router-link class="icon-btn mx-2" to="/terms" :title="t('button.Terms')">
      <carbon-deploy-rules />
    </router-link>

    <router-link class="icon-btn mx-2" to="/timeline" :title="t('button.TimeLine')">
      <carbon-ai-status-in-progress />
    </router-link>
  </nav>
</template>
