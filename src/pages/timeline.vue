<template>
  <div class="container mx-auto">
    <transition-group name="flip-list" tag="div">
      <div v-for="proj in data" :key="proj.key" class="">
        <em :style="`color:${proj.color}`">{{ proj.year }}</em>
        <div class="card p-4 table rounded w-xs h-20" :class="proj.key % 2? 'ml-lg mr-auto' : 'ml-auto mr-lg'" :style="`background-color:${proj.color}`">
          <span class="title block">
            {{ proj.name }}
          </span>
          <div class="desc">
            {{ proj.text }}
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue'
import { history } from '../statics'
export default {
  setup() {
    const data = reactive(history)
    return {
      data,
    }
  },
}
</script>
