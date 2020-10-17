<template>
  <div class="q-pa-sm q-mx-auto q-my-xs scroll">
    <div class="text-h3">Welcome,<span> {{user.username}}</span></div>
    <p>Your Email: {{user.signInUserSession.idToken.payload.email}}</p>
    <p>Verified: {{user.signInUserSession.idToken.payload.email_verified}}</p>
  </div>
</template>
<script>
export default {
  name: 'Profile',
  components: {
  },
  data () {
    return {
      user: {},
      signedIn: false
    }
  },
  beforeCreate () {
    this.$Auth.currentAuthenticatedUser()
      .then(user => {
        this.user = user
        this.signedIn = true
      })
      .catch(() => console.log('not signed in...'))
  }
}
</script>
<style>
</style>
