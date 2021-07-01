<template>
  <div
    class="section link-template"
  >
    <slot />
  </div>
</template>
<script lang="ts">
export default {
  name: 'LinkTemplate',
}
</script>
<style>
.link-template{
    height: 10rem;
}
.link-template h2{
    margin-top: 1rem!important;
    margin-bottom: 1rem!important;
    height: 1rem;
}

.link-template p {
    height:.5rem;
}
</style>
