<template>
  <iframe :src="src" :key="src" class="fit" style="min-height: 40em" frameborder="0"></iframe>
</template>
<script>
export default {
  data () {
    return {
      src: 'https://sudoku17.netlify.app'
    }
  }
}
</script>
<style>
</style>
