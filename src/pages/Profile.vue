<template>
  <q-page padding>
    <q-skeleton
      class="q-pa-sm q-mx-auto q-my-xs scroll"
      v-if="!currentUser"
    ></q-skeleton>
    <div class="q-pa-sm q-mx-auto q-my-xs scroll" v-else>
      <div class="text-h3">
        <span>Welcome!</span>
      </div>
      <p>
        Your Email: {{ currentUser.email }}, verified:
        {{ currentUser.email_verified }}
      </p>
      <p>
        Your Phone: {{ currentUser.phone_number }}, verified:
        {{ currentUser.phone_number_verified }}
      </p>
    </div>
  </q-page>
</template>
<script>
export default {
  name: 'Profile',
  components: {},
  data () {
    return {
      user: {},
      signedIn: false
    }
  },
  beforeMount () {
    this.$Auth
      .currentAuthenticatedUser()
      .then(user => {
        this.user = user
        this.signedIn = true
      })
      .catch(() => console.log('not signed in...'))
  },
  computed: {
    currentUser () {
      return this.user.attributes
    }
  }
}
</script>
<style></style>
