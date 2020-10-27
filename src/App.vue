<template>
  <div id="q-app" >
    <router-view/>
  </div>
</template>

<script>
import meta from 'src/utils/meta'
export default {
  name: 'App',
  beforeCreate () {
    this.$AmplifyEventBus.$on('authState', info => {
      if (info === 'signedIn') {
        this.signedIn = true
        this.$router.push('/')
      }
      if (info === 'signedOut') {
        this.$router.push('/auth')
        this.signedIn = false
      }
    })
    this.$Auth.currentAuthenticatedUser()
      .then(user => {
        this.signedIn = true
      })
      // eslint-disable-next-line
      .catch(() => this.signedIn = false)
  },
  data () {
    return {
      signedIn: false,
      hydrated: false,
      metaTags: {
        title: 'Wael Wahbeh Portfolio',
        description: 'Perfolio Website',
        url: 'https://waelio.com',
        images: 'https://waelio.com/img/profile_pic.jpg'
      },
      meta
    }
  },
  async mounted () {
    await this.$apollo.provider.defaultClient.hydrated()
    this.hydrated = true
  }
}
</script>

<style>
</style>
