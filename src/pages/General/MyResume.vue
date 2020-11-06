<template>
  <div class="q-pa-md fit scroll" style="min-height: 500px">
    <iframe class="full-width full-vh scroll" src="pdf/Waels_Resume_Fresh.pdf" frameborder="0"></iframe>
  </div>
</template>

<script>
import meta from 'src/utils/meta'
export default {
  name: 'MyResume',
  data () {
    return {
      metaTags: {
        title: 'Current CV 2020',
        description: 'My uptodate resume. As of November 2020'
      }
    }
  },
  meta
}
</script>
<style lang="scss" scoped>
  .absolute {
    position: relative!important;
  }
  .full-vh {
    min-height: 100vh!important;
  }
</style>
