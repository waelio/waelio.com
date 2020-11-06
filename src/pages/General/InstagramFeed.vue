<template>
  <q-page class="q-pa-md q-mx-auto">
    <iframe class="q-mx-auto block" src="https://embedsocial.com/facebook_album/pro_instagram/67a4c9d90d7b269b2c48325d2bfda540206bf54a" width="900px" height="1200px" frameborder="0" marginheight="0" marginwidth="0"></iframe>
  </q-page>
</template>
<script>
import meta from 'src/utils/meta'
export default {
  name: 'InstagramFeed',
  data () {
    return {
      metaTags: {
        title: 'Instagram Feed',
        describtion: 'nb'
      }
    }
  },
  meta
}
</script>
<style>
iframe .powered-by {
  display: none!important;
}
</style>
