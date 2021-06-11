<template>
  <div>
    <p class="text-4xl mb-2">
      <carbon-campsite class="inline-block" />
    </p>
    <p>
      <a rel="noreferrer" href="https://github.com/waelio" target="_blank">
        <h3 class="text-lg">Waelio</h3>
      </a>
    </p>
    <p>
      <em class="text-sm opacity-75">{{ t('intro.desc') }}</em>
    </p>
    <div
      class="mt-6 mx-auto mb-3 links-list lg:flex"
    >
      <Links1 />
      <Links2 />
      <Links3 />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
<style>
  .links-list{
    align-items: stretch;
    justify-content: space-around;
    align-content: stretch;
    flex-wrap: nowrap;
    flex-direction: row;
  }
  .link-template{
    text-align: -webkit-center;
  }
</style>

<route lang="yaml">
meta:
  layout: home
</route>
