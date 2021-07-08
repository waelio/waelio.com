<template>
  <div>
    <h1>WaelioUtils</h1>
    <ol class="mx-auto p-lg inline-block">
      <li v-for="(f, i) in contain" :key="i" class="util-func">
        <div v-if="!blackList.includes(f.name)" class="flex">
          <router-link :to="{path:`/utils/${f.name}`}">
            <em>{{ i+1 }}</em><span class="ml-5 text-bolder text-left">{{ f.name }}</span>
          </router-link>
        </div>
        <div v-else class="flex">
          <em>{{ i+1 }}</em><span class="ml-5 text-bolder text-left">{{ f.name }}</span>
        </div>
      </li>
    </ol>
  </div>
</template>
<script setup lang="ts">
import { waelioUtils } from 'waelio-utils'
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'
import { computed, ref, onBeforeMount } from 'vue'
const { t } = useI18n()
const blackList = ref(['_formatErrors', '_parseErrors', 'calculateClockDrift'])
useHead({
  title: 'Waelio-utils',
  meta: [{ name: 'description', content: t('intro.desc') }],
})
const contain = ref([])
onBeforeMount(() => {
  for (const [key, value] of Object.entries(waelioUtils)) {
    const name = `${key}`
    const val = `${value}`
    contain.value.push({ name })
  }
})

</script>
<style scoped>
h1 {
  font-size: 2em;
  text-decoration: underline;
  margin-bottom: 1em;
}
.util-func:hover{
  color: blueviolet;
  font-weight: bold;
}
</style>
