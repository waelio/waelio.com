<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'
import { useTimeAgo } from '@vueuse/core'
import moment from 'moment'
import { ref } from 'vue'

import { isDark } from '~/logic'
const { t } = useI18n()
useHead({
  title: 'Waelio',
  meta: [{ name: 'description', content: t('intro.desc') }],
})

const darkMode = ref(isDark)
const date = '__DATE__'
const timeAgo = useTimeAgo(date)
const BuildTime = moment(date).format('ddd MMM DD, YYYY [at] HH:mm')
</script>
<template>
  <router-view></router-view>
  <div class="text-center" :class="darkMode?'text-white':'text-dark'">
    Built at: {{ BuildTime }} ({{ timeAgo }})
  </div>
</template>
