<template>
  <div class="container mx-auto xl:px-4 min-w-xs">
    <transition-group name="flip-list" tag="div">
      <div v-for="proj in data" :key="proj.key" class="">
        <em :style="`color:${proj.color}`">{{ proj.year }}</em>
        <div
          class="card p-4 table rounded w-xs h-20"
          :class="proj.key % 2? 'ml-lg mr-auto' : 'ml-auto mr-lg'"
          :style="`background-color:${proj.color};${isDark ? 'color:white;' : 'color:black;' }`"
        >
          <span class="title block" :style="`${isDark ? 'color:inherit;' : 'color:white;' }`">
            {{ proj.name }}
          </span>
          <div class="desc" :style="`${isDark ? 'color:inherit;' : 'color:white;' }`">
            {{ proj.text }}
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script lang="ts">
import { reactive, computed } from 'vue'
import { useHead } from '@vueuse/head'

import { history } from '../statics'
import { isDark } from '~/logic'
export default {
  setup() {
    const data = reactive(history)
    const siteData = reactive({
      title: 'Waelio | Timeline',
      description: 'Down memory lane, logo, basic, cb, php, mysql, python, javascript, mssql and more',
      keywords: 'logo, basic, cb, php, mysql, python, javascript, mssql',
    })
    useHead({
      // Can be static or computed
      title: computed(() => siteData.title),
      meta: [
        {
          name: 'description',
          content: computed(() => siteData.description),
          keywords: computed(() => siteData.keywords),
        },
      ],
    })
    return {
      data,
      isDark,
    }
  },
}
</script>
