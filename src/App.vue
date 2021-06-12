<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
useHead({
  title: 'Waelio',
  meta: [{ name: 'description', content: t('intro.desc') }],
})
</script>

<template>
  <router-view class="h-1 mx-auto" />
</template>
