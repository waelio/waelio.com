<template>
  <div id="q-app">
    <div v-if="!online">You are offline.</div>
    <div v-bind:class="{ offline: offline }">
      <router-view v-if="hydrated" />
    </div>
  </div>
</template>
<script>
import meta from 'src/utils/meta'
import { Hub } from 'aws-amplify'
import { Notify } from 'quasar'
import 'src/utils/pwa_updates'
import oAuthMixin from 'src/mixins/oAuthMixin'

export default {
  name: 'App',
  mixins: [oAuthMixin],
  beforeCreate () {
    window.isUpdateAvailable.then(isAvailable => {
      if (isAvailable) {
        Notify.create({
          message: 'messages.update_available',
          icon: 'cloud_download',
          closeBtn: 'labels.update',
          timeout: 10000,
          onDismiss () {
            window.location.reload()
          }
        })
      }
    })
    this.$AmplifyEventBus.$on('authState', State => {
      if (State === 'signedIn') {
        this.signedIn = true
        this.$router.push('/')
      }
      if (State === 'signedOut') {
        this.$router.push('/auth/process')
        this.signedIn = false
      }
    })
  },
  created () {
    try {
      // if (this.signedIn !== false) {
      this.listener = Hub.listen('datastore', async capsule => {
        const {
          payload: { event, data }
        } = capsule
        if (event === 'networkStatus') {
          this.offline = !data.active
        }
      })
      // }
    } catch (error) {
      Notify.create({
        message: 'messages.update_available',
        icon: 'error',
        closeBtn: 'labels.update',
        timeout: 10000,
        onDismiss () {
          window.location.reload()
        }
      })
    }
  },
  async mounted () {
    await this.$apollo.provider.defaultClient.hydrated()
    this.hydrated = true
  },
  data () {
    return {
      hydrated: false,
      listener: null,
      offline: window && !window.navigator.onLine,
      metaTags: {
        title: 'Wael Wahbeh Portfolio',
        description:
          'Personal Portfolio Website with current projects, links to previous projects. Contact US page as well as support page for other online projects. Welcome Friends.',
        url: 'https://waelio.com',
        images: 'https://waelio.com/img/profile_pic.jpg'
      },
      meta
    }
  },
  computed: {
    online () {
      return window && window.navigator.onLine
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
<style></style>
