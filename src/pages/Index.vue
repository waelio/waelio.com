<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  const router = useRouter();
  const name = ref('');
  const { t } = useI18n();
</script>

<template>
  <div>
    <p class="text-4xl mb-2">
      <carbon-campsite class="inline-block" />
    </p>
    <p>
      <a rel="noreferrer" href="https://github.com/waelio" target="_blank">
        Waelio
      </a>
    </p>
    <p>
      <em class="text-sm opacity-75">{{ t('intro.desc') }}</em>
    </p>
    <Links1 />
    <Links2 />
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
