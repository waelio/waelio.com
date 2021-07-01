<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { defineProps, computed, ref } from 'vue'
import { waelioUtils } from 'waelio-utils'
console.log("🚀 ~ file: [name].vue ~ line 6 ~ waelioUtils", waelioUtils)

const props = defineProps({
  name: {
    type: String,
    default: 'ww',
    required: false,
  },
})
const contain = ref([])
const closestPlugin = computed(()=>{
    return contain.value.find(one=> one.name.toUpperCase() == props.name.toUpperCase())
})

const router = useRouter()
const { t } = useI18n()
for(const [key, value] of Object.entries(waelioUtils)) {
  const name = `${key}`
  const val = `${value}`
  contain.value.push({ name  })
}

</script>

<template>
  <div>
    <p class="text-4xl">
      <carbon-tools class="inline-block" />
    </p>
    <p>
      {{  {closestPlugin}  }}
    </p>
    <p class="text-sm">
      {{ t('intro.hi',{name: props.name})}}
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