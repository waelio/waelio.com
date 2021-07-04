<template>
  <div>
    <h2 class="text-center"> {{ name }} </h2>
    <div class="section link-template">
      <slot />
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: 'LinkTemplate',
  props: {
    name: {
      type: String,
      default: 'ww',
      required: false,
    },
  },
}
</script>
<style>
.link-template{
   /* height: 3rem; */
  display: flex;
  flex-direction: row;
  align-content: flex-end;
  justify-content: space-around;
  align-items: flex-start;
  flex-wrap: wrap;
  max-width: 350px;
  margin: auto;
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
