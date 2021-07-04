---
title: Waelio | Home
---
<!-- https://gist.github.com/waelio -->
<client-only>
  <div id="home_page" class="mx-auto">
    <div class="text-2xl mx-auto">    
      <a rel="noreferrer" href="https://github.com/waelio" target="_blank" class="block my-2">
        <h3 class="text-center">Waelio</h3>
      </a>
      <p class=""><em class="text-sm opacity-75 px-4">{{ t('intro.desc') }}</em></p>
    </div>    
    <div class="mx-auto links-list">
      <Links1 />
      <Links2 />
      <Links3 /> 
    </div>
  </div>
  <Subscriptions />
</client-only>
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
// vscode://vscode.github-authentication/did-authenticate?windowid=12&code=eaf7cbf2cb4a73d1c4a7&state=9de87a84-0d4a-4c7c-b35f-42bce631baed
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '~/store/store.root'
const { t } = useI18n()
const  store  = useStore()
onMounted( () => {
  console.log('mounted in the Vite api!') 
})
</script>
<route lang="yaml">
meta:
  layout: home
</route>
