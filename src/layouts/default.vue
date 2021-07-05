<script setup lang="ts">
import { ref, computed } from 'vue'
import { isDark } from '~/logic'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const dimensions = ref($q.screen|| {height: 1000})
const draggingFab: boolean = ref(true)
let fabPos: Ref<number[]>  = ref([18, 18])
 const moveFab = (ev): void => {
      draggingFab.value = ev.isFirst !== true && ev.isFinal !== true;
      fabPos = [fabPos[0]- ev.delta.x, fabPos[1] - ev.delta.y];
    }
</script>
<template>
  <main class="px-4 py-2 text-center text-gray-700 dark:text-gray-200">
    <q-Layout  view="lHh Lpr lFf" container :style="`height:${dimensions.height*.96}px;`" >
      <q-header reveal elevated>
        <Header />
      </q-header>
    <q-page-container>
      <router-view />
      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="fabPos"
        :draggable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-btn
          fab          
          :color=" isDark ? 'white' : 'dark'"
          :text-color="!isDark ? 'white' : 'dark'"
        ><q-icon name="keyboard_arrow_up" /></q-btn>
      </q-page-scroller>
    </q-page-container>
    <q-footer>
      <Footer />
    </q-footer>
  </q-layout>
  </main>
</template>
<style scoped>
.q-layout{
  min-height: unset!important;
}
</style>
