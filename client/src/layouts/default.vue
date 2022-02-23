<script  lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useQuasar } from 'quasar'
import { isDark } from '~/logic'
export default {
  setup() {
    const $q = useQuasar()
    const dimensions = ref($q ? $q.screen : { height: 1000 })
    const draggingFab: Ref<boolean> = ref(true)
    let fabPos: Ref<number[]> = ref([18, 18])
    const moveFab = (ev: any): void => {
      draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
      fabPos = ref([fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y])
    }

    return {
      dimensions,
      draggingFab,
      fabPos,
      moveFab,
      isDark,
    }
  },
}
</script>
<template>
  <main class="px-4 py-2 text-center text-gray-700 dark:text-gray-200">
    <client-only>
      <q-Layout view="lHh lpr fFf" container :style="`height:${dimensions.height*.96}px;`">
        <q-header reveal elevated>
          <Header />
        </q-header>
        <q-page-container>
          <router-view />
          <q-page-scroller
            v-touch-pan.prevent.mouse="moveFab"
            position="bottom-right"
            :scroll-offset="150"
            :offset="fabPos"
            :draggable="draggingFab"
          >
            <q-btn
              fab
              :color=" isDark ? 'white' : 'dark'"
              :text-color="!isDark ? 'white' : 'dark'"
            >
              <q-icon name="keyboard_arrow_up" />
            </q-btn>
          </q-page-scroller>
        </q-page-container>
        <q-footer>
          <Footer />
        </q-footer>
      </q-layout>
    </client-only>
  </main>
</template>
<style scoped>
.q-layout{
  min-height: unset!important;
}
</style>
