<template>
  <div id="q-app" >
    <router-view v-if="hydrated" />
  </div>
</template>
<script>
import meta from 'src/utils/meta'
import { DataStore, Predicates } from '@aws-amplify/datastore'
import { Hub } from 'aws-amplify'
import { Chatty } from './models'
export default {
  name: 'App',
  beforeCreate () {
    this.$AmplifyEventBus.$on('authState', info => {
      if (info === 'signedIn') {
        this.signedIn = true
        this.$router.push('/')
      }
      if (info === 'signedOut') {
        this.$router.push('/auth/authenticate')
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
  async mounted () {
    // if (this.signedIn !== false) {
    this.messages = await DataStore.query(Chatty, Predicates.ALL)
    // }
    await this.$apollo.provider.defaultClient.hydrated()
    this.hydrated = true
  },
  created () {
    this.listener = Hub.listen('datastore', async (capsule) => {
      const { payload: { event, data } } = capsule
      if (event === 'networkStatus') {
        this.offline = !data.active
      }
    })
  },
  data () {
    return {
      signedIn: false,
      hydrated: false,
      listener: null,
      offline: undefined,
      messages: [],
      metaTags: {
        title: 'Wael Wahbeh Portfolio',
        description: 'Personal Portfolio Website with current projects, links to previous projects. Contact US page as well as support page for other online projects. Welcome Friends.',
        url: 'https://waelio.com',
        images: 'https://waelio.com/img/profile_pic.jpg'
      },
      meta
    }
  },
  watch: {
    '$route.query' (newR) {
      if (newR.app && newR.target) {
        this.$router.push(`/apps/${newR.app}/${newR.target}`)
      }
    }
  }
}
</script>
<style>
</style>
