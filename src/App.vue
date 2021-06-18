<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'
import { timestamp } from '@vueuse/shared'
import { useTimeAgo } from '@vueuse/core'
import ReloadPrompt from '~/components/ReloadPrompt.vue'
import moment from 'moment'
import { isDark } from '~/logic'

const { t } = useI18n()
useHead({
  title: 'Waelio',
  meta: [{ name: 'description', content: t('intro.desc') }],
})

const date = timestamp()
const timeAgo = useTimeAgo(date)
</script>

<template>
  <router-view />
  <ReloadPrompt />
  <div class="text-center" :class="isDark?'text-white':'text-dark'">
    Built at: {{ moment(date).format("ddd MMM DD, YYYY [at] HH:mm") }} ({{ timeAgo }})
  </div>
</template>
