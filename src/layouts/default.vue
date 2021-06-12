<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <main class="px-4 py-2 text-center text-gray-700 dark:text-gray-200">
    <Header />
    <router-view class="overflow-y-scroll mx-auto" />
    <Footer />
    <div class="mt-2 mx-auto text-center opacity-25 text-sm">
      <router-link class="icon-btn mx-2" to="/" :title="t('button.home')">
        <carbon-campsite /> Waelio.com
      </router-link>
    </div>
  </main>
</template>
