<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import Links1 from '../components/Links1.md';
  import Links2 from '../components/Links2.md';
  const name = ref('');

  const router = useRouter();
  const { t } = useI18n();
</script>

<template>
  <div>
    <p class="text-4xl">
      <carbon-campsite class="inline-block" />
    </p>
    <p>
      <a rel="noreferrer" href="https://github.com/antfu/vitesse" target="_blank">
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
