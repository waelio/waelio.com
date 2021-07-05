<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useI18n } from 'vue-i18n'
import { defineProps, computed, ref, watch, watchEffect, onBeforeMount } from 'vue'
import { waelioUtils } from 'waelio-utils'
import { isDark } from '~/logic'
const { t } = useI18n()
const contain = ref([])
const router = useRouter()
const salt = ref('3uqi11wg9')
const props = defineProps({
  name: {
    type: String,
    default: 'ww',
    required: false,
  },
})
for (const [K, V] of Object.entries(waelioUtils)) {
  const name = `${K}`
  const value = () => waelioUtils.resetString(V)
  const payload = { name, value }
  contain.value.push(payload)
}
const closestPlugin = computed(() => {
  return contain.value.find(one => one.name.toUpperCase().match(props.name.toUpperCase()))
})
const notFound = 'Who?'
const pluginName = computed(() => { return closestPlugin.value ? closestPlugin.value.name : notFound })
const incomingParam2 = computed(() => router.currentRoute.value.query.param2)
let reversePlugin = ref('_decrypt')
let isSpecial = ref(false)
const dec1 = ref('0312040321161b021246')
const dec2 = ref('2c550312040321161b021246555b550312040321161b021245555b550312040321161b021244552a')
const dec3 = ref('2c465b455b445b435b425b415b405b4f5b4e2a')
const dec4 = ref('0c55031e031b12554d550016121b1e1822031e1b045928121914050e0703555b551a120316554d2c0c5519161a12554d5513120414051e07031e1819555b5514181903121903554d553d1601162414051e0703571219031f02041e1604035b5720181b11572716141c57150518031f12055b573302141c04571b180112055b57161b1b571615180203570512020416151e1b1e030e57161913571e1a07051801121a1219030459550a2a0a')
const test1 = ref('testValue1')
const test2 = ref(['testValue1', 'testValue2', 'testValue3'])
const test3 = ref([1, 2, 3, 4, 5, 6, 7, 8, 9])
const test4 = ref({
  title: `waelioUtils.${pluginName.value}`,
  _id: '0312040321161b021246',
  meta: [{ name: 'description', content: t('intro.desc') }],
})
let param1 = ref(salt.value || null)
let param2: any = ref(null)
useHead({
  title: `waelioUtils.${pluginName.value}`,
  meta: [{ name: 'description', content: t('intro.desc') }],
})
const reverseResult = computed(() => {
  let test = null
  if (isSpecial && reversePlugin) {
    test = waelioUtils[pluginName.value](param1.value, param2.value)
    if (test)
      return waelioUtils[reversePlugin.value](param1.value || param1.value, test && test)
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: [name].vue ~ line 56 ~ reverseResult ~ test', test)
  }
  return false
})
watchEffect(() => {
  switch (true) {
    case pluginName.value === 'generateId':
      param1 = ref(salt)
      param2 = ref(null)
      break
    case pluginName.value === '_encrypt':
      param1 = ref(salt)
      param2 = incomingParam2.value ? incomingParam2.value : ref(test1)
      reversePlugin = ref('_decrypt')
      isSpecial = ref(true)
      break
    case pluginName.value === '_decrypt':
      param1 = ref(salt)
      param2 = incomingParam2.value ? incomingParam2.value : ref(test1)
      reversePlugin = ref('_encrypt')
      isSpecial = ref(true)
      break
    default:
      isSpecial = ref(false)
      param1 = ref(test1)
      break
  }
  return pluginName
})
watch(incomingParam2, (newParam2) => {
  if (newParam2)
    param2 = newParam2
})

</script>
<template>
  <div class="util-page">
    <div class="page-intro text-left mt-5 mx-auto bg-blue-400 text-light-200 p-1 ">
      <carbon-tools class="inline-block mx-2" />
      Choose a predefined values for params.
    </div>
    <div class="params-selection">
      <div class="param param1">
        <label class="text-blue-500" for="param-one-select">param1</label>
        <select id="param-one-select" v-model="param1" :class="{ 'bg-dark-200 text-blue-300' : isDark }">
          <option key="test1" :value="test1">
            {{ test1 }}
          </option>
          <option key="test2" :value="test2">
            {{ test2 }}
          </option>
          <option key="test3" :value="test3">
            {{ test3 }}
          </option>
          <option key="test4" :value="test4">
            {{ test4 }}
          </option>
        </select>
      </div>
      <div class="param param2">
        <label class="text-blue-500" for="param-two-select">param2</label>
        <select id="param-two-select" v-model="param2" :class="{ 'bg-dark-200 text-blue-300' : isDark }">
          :class="{ 'bg-dark-200 text-yellow-300' : isDark }"
          <option key="test1" :value="test1">
            {{ test1 }}
          </option>
          <option key="test2" :value="test2">
            {{ test2 }}
          </option>
          <option key="test3" :value="test3">
            {{ test3 }}
          </option>
          <option key="test4" :value="test4">
            {{ test4 }}
          </option>
          <option key="dec1" :value="dec1">
            {{ dec1 }}
          </option>
          <option key="dec2" :value="dec2">
            {{ dec2 }}
          </option>
          <option key="dec3" :value="dec3">
            {{ dec3 }}
          </option>
          <option key="dec4" :value="dec4">
            {{ dec4 }}
          </option>
        </select>
      </div>
    </div>
    <hr class="p-1 my-3 bg-blue-300" />

    <div v-if="pluginName.value !== notFound">
      <p class="my-4 text-left px-4 text-lg">
        Using function name <code lang="js" class="text-blue-700 text-bold ">{{ closestPlugin.name || notFound }}</code>.
      </p>

      <p class="my-4 text-left px-4 text-lg">
        The following output is the result of:
      </p>
      <div v-if="param2" class="result_pan mx-auto ">
        <code class="block mx-auto font-mono p-1 rounded text-shadow-lg text-x0" :class="{ 'bg-light-blue-200' : !isDark }" lang="javascript"> waelioUtils.{{ pluginName }}({{ param1 }}, {{ param2 }})</code>
        <pre class=" mx-auto my-8 bg-dark-100 p-1 rounded-sm text-white">{{ waelioUtils[pluginName](param1, param2) }}</pre>

        <code v-if="isSpecial" class="block mx-auto font-mono p-1 rounded text-shadow-lg text-x0" :class="{ 'bg-light-blue-200' : !isDark }" lang="javascript"> waelioUtils.{{ reversePlugin }} ( {{ param1 }}, {{ param2 }} )</code>
        <pre v-if="isSpecial" class=" mx-auto my-8 bg-dark-100 p-1 rounded-sm text-white">{{ reverseResult || waelioUtils[reversePlugin](param1, param2) }}</pre>
      </div>
      <div v-else class="result_pan mx-auto">
        <code class="block mx-auto font-mono p-1 rounded text-shadow-lg text-x0" :class="{ 'bg-light-blue-200' : !isDark }" lang="javascript"> waelioUtils.{{ pluginName }}({{ param1 }})</code>
        <pre class=" mx-auto my-8 bg-dark-100 p-1 rounded-sm text-white">{{ waelioUtils[pluginName](param1) }}</pre>
      </div>
    </div>

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
<style scoped>
  .page-intro{
    max-width: 450px;
    display: block;
    border-radius: 4px;
  }
  .params-selection{
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    align-content: stretch;
    flex-direction: column;
    flex-wrap: wrap;
  }
  label{
    text-transform: capitalize;
    text-align: left;
    display: block;
    text-indent: .5rem;
  }
  select{
    display: block;
    margin: auto;
    border: 1px solid lightgrey;
    outline: 1px solid lightblue;
    max-width: min-content;
    width: 350px;
  }
  option *{
    max-width: inherit;
    overflow: scroll;
    padding: 1rem;
    border-radius: 4px;
  }
  pre{
    height: 5rem;
    overflow: hidden;
    border: none;
    outline: none;
    padding: .2rem;
    text-overflow: ellipsis;
    word-break: break-all;
  }
</style>
