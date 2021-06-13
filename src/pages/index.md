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
    class="mx-auto links-list lg:flex"
  >
    <Links1 />
    <Links2 />
    <Links3 />
  </div>
  <button  @click="subscription" >.</button>
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
import { useI18n } from 'vue-i18n'
import { Send } from '../pwa'

const { t } = useI18n()
const onSubscribe = async () => {
  try {
    const subscription = await Send()
    console.log('subscription', subscription);
  } catch (e) {
    console.error(e)
  }
}
</script>

<route lang="yaml">
meta:
  layout: home
</route>
