<template>
<div class="q-mx-auto">
  <h1 class="text-center text-h3">Auth Pages</h1>
    <router-view />
</div>
</template>
<script>
export default {
  name: 'auth',
  props: ['isLoggedIn', 'signOut'],
  beforeMount () {
    // const vm = this
    // vm.$router.push(vm.$props.isLoggedIn ? '/auth/profile' : '/auth/authenticate')
  }
  // beforeRouteEnter (to, from) {
  //   console.log('from', from)
  //   console.log('to', to)
  // }
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
