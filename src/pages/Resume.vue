<template>
  <div class="q-pa-md scroll">
    <iframe class="full-width full-vh scroll" src="pdf/Waels_Resume_Fresh.pdf" frameborder="0"></iframe>
  </div>
</template>

<script>
export default {
  name: 'MyResume',
  data () {
    return {
      visible: true
    }
  }
}
</script>
<style lang="scss" >
  .full-vh {
    min-height: 100vh!important;
  }
</style>
