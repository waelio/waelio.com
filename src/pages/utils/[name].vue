<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'
import { defineProps, computed, ref } from 'vue'
import { waelioUtils } from 'waelio-utils'
const { t } = useI18n()
const contain = ref([])
const router = useRouter()
const props = defineProps({
  name: {
    type: String,
    default: 'ww',
    required: false,
  },
})
const closestPlugin = computed(() => {
  return contain.value.find(one => one.name.toUpperCase() == props.name.toUpperCase())
})

for (const [key, value] of Object.entries(waelioUtils)) {
  const name = `${key}`
  const val = `${value}`
  contain.value.push({ name })
}
const pluginName = computed(() => { return (closestPlugin && closestPlugin.value) ? closestPlugin.value.name : 'Who?' })
useHead({
  title: `Waelio | ${pluginName.value}`,
  meta: [{ name: 'description', content: t('intro.desc') }],
})
</script>
<template>
  <div>
    <p class="text-4xl">
      <carbon-tools class="inline-block" />
    </p>
    <p>
      {{ {closestPlugin} }}
    </p>
    <p class="text-sm">
      {{ t('intro.hi',{name: props.name}) }}
    </p>
    <!-- <pre><code>{{  closestPlugin }}</code></pre> -->
    <div>
      <button
        class="btn m-3 text-sm mt-8"
        @click="router.back()"
      >
        {{ t('button.back') }}
      </button>
    </div>
  </div>
</template>
