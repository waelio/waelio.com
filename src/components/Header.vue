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
  <nav class="text-md mb-6 mx-auto text-center">
    <router-link class="icon-btn mx-2 text-sm" to="/" :title="t('button.home')">
      {{ t('button.home') }}
    </router-link>
    |
    <router-link class="icon-btn mx-2 text-sm" to="/about" :title="t('button.about')">
      {{ t('button.about') }}
    </router-link>
    |
    <router-link class="icon-btn mx-2 text-sm" to="/contact" :title="t('button.Contact')">
      {{ t('button.Contact') }}
    </router-link>
    |
    <!-- <router-link class="icon-btn mx-2 text-sm" to="/privacy" :title="t('button.Privacy')">
      {{ t('button.Privacy_Short') }}
    </router-link>
    |
    <router-link class="icon-btn mx-2 text-sm" to="/terms" :title="t('button.Terms')">
      {{ t('button.Terms_Short') }}
    </router-link>
    | -->
    <router-link class="icon-btn mx-2 text-sm" to="/timeline" :title="t('button.TimeLine')">
      {{ t('button.TimeLine') }}
    </router-link>
  </nav>
</template>
