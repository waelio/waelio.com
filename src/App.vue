<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'
import { useTimeAgo } from '@vueuse/core'

const { t } = useI18n()
useHead({
  title: 'Waelio',
  meta: [{ name: 'description', content: t('intro.desc') }],
})
const date = '__DATE__'
const timeAgo = useTimeAgo(date)
</script>

<template>
  <router-view class="mx-auto" />
  <ReloadPrompt />
  <div class="text-center">
    Built at: {{ date }} ({{ timeAgo }})
  </div>
</template>
