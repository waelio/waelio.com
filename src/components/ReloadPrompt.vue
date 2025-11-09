<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
const isClient = (): boolean => Boolean(typeof window !== 'undefined' && 'serviceWorker' in navigator)

const close = async() => {
  offlineReady.value = false
  needRefresh.value = false
}

</script>
<template>
  <div
    v-if="offlineReady || needRefresh && isClient"
    class="pwa-toast bg-white"
    role="alert"
  >
    <div class="message">
      <span v-if="offlineReady">
        {{ t('button.offline_ready') }}
      </span>
      <span v-if="needRefresh">
        {{ t('button.new_content') }}
      </span>
    </div>
    <button v-if="needRefresh" @click="updateServiceWorker()">
      {{ t('button.reload') }}
    </button>
    <button @click="close">
      {{ t('button.close') }}
    </button>
  </div>
</template>
<style>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #8885;
  border-radius: 4px;
  z-index: 1;
  text-align: left;
  box-shadow: 3px 4px 5px 0px #8885;
}
.pwa-toast .message {
  margin-bottom: 8px;
}
.pwa-toast button {
  border: 1px solid #8885;
  outline: none;
  margin-right: 5px;
  border-radius: 2px;
  padding: 3px 10px;
}
</style>
