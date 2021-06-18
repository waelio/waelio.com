---
title: Waelio | Home
---
<div id="home_page" class="mx-auto">
  <div class="text-2xl mx-auto">    
    <a rel="noreferrer" href="https://github.com/waelio" target="_blank" class="block my-2">
      <h3 class="text-center">Waelio</h3>
    </a>
    <p class="">
      <em class="text-sm opacity-75 px-4">{{ t('intro.desc') }}</em>
    </p>
  </div>
  <div
    class="mx-auto links-list"
  >
    <Links1 />
    <Links2 />
    <Links3 />
  </div>
    <div
    class="mx-auto links-list flex"
  >
  <button style="background-color:gray" class="block mx-auto" @click="onSubscribe" ><carbon:notification-filled /><span class="px-1 align-top">Subscribe</span></button>
  <button style="background-color:gray" class="block mx-auto" @click="onUnsubscribe"><carbon:notification-off-filled/><span class="px-1 align-top">Unsubscribe</span></button>
  </div>
</div>

<style>
  #home_page {
    font-size: initial;
    line-height: initial;
  }
  #home_page h3{
    margin: unset!important
  }
</style>
<script setup lang="ts">
import { Subscribe, unSubscribe, isSubscribed } from '~/pwa.ts'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
// import { pinia } from 'src/modules/store.pinia.ts'
// import { useNotifications } from 'src/store/notifications.pinia.ts'

const { t } = useI18n()
// const  p  = useNotifications(pinia)
const onSubscribe = async () => {
  try {
    const subscription = await Subscribe()
    console.log("🚀 ~ file: index.md ~ line 42 ~ onSubscribe ~ subscription", subscription)
  } catch (e) {
    console.error(e)
  }
}
onMounted(async () => {
  console.log('mounted in the Vite api!')
  // if (typeof window !== 'undefined') {
  //   if ('serviceWorker' in navigator) {
      isSubscribed()
  //   }
  // }
})
const onUnsubscribe = async () => {
  try {
    const subscription = await unSubscribe()
    console.log("🚀 ~ file: index.md ~ line 49 ~ onUnsubscribe ~ subscription", subscription)
  } catch (e) {
    console.error(e)
  }
}
</script>

<route lang="yaml">
meta:
  layout: home
</route>
