<template>
<div class="q-pa-md q-mx-auto">
    <router-view />
</div>
</template>
<script>
export default {
  name: 'authRouter'
}
</script>
<style>
.error {
  background-color: red;
  color: white;
  font-weight: bold;
  font-size: 1.4 rem;
  text-align: center;
  padding: 5px 2px;
  margin-top: 5px;
}
</style>
