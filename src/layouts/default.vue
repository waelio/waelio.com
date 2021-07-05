<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { isDark } from '~/logic'
const { t } = useI18n()
const draggingFab = ref(true)
let fabPos: Ref<number[]>  = ref([18, 18])
 const moveFab = (ev): void => {
      draggingFab.value = ev.isFirst !== true && ev.isFinal !== true;
      fabPos = [fabPos[0]- ev.delta.x, fabPos[1] - ev.delta.y];
    }
</script>
<template>
    <QLayout  class="px-4 py-2 text-center text-gray-700 dark:text-gray-200">
    <Header />
    <QPageContainer>
      <router-view />
      <QPageScroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="fabPos"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <QBtn
          fab          
          :color="isDark?'white':'dark'"
          :text-color="!isDark?'white':'dark'"
        ><QIcon name="keyboard_arrow_up" /></QBtn>
      </QPageScroller>
    </QPageContainer>
    <Footer />
  </QLayout>
  <!-- <main class="px-4 py-2 text-center text-gray-700 dark:text-gray-200">
    <router-view class="mx-auto" />
  </main> -->
</template>
<style scoped>
.q-layout{
  min-height: unset!important;
}
</style>
