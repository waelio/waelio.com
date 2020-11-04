<template>
  <q-layout view="lHh Lpr lFf" class="shadow-2 rounded-borderes">
    <q-header ereveal elevated class="glossy">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>
        <div class="row">
          <q-toolbar-title>
            <router-link class="text-white text-sm" to="/">
              Waelio.com</router-link
            ></q-toolbar-title
          >

          <div class="fixed-right q-pr-xs full-height">v{{ $q.version }}</div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <left-sidebar :isLoggedIn="isLoggedIn" @signOut="signOut" />
    </q-drawer>

    <q-page-container>
      <q-page>
        <router-view :isLoggedIn="isLoggedIn" class="q-mx-auto slitter" />
        <q-page-scroller
          expand
          position="top"
          :scroll-offset="150"
          :offset="[0, 0]"
        >
          <div
            class="col cursor-pointer q-pa-sm bg-warning text-white text-center"
          >
            Scroll back up...
          </div>
        </q-page-scroller>
      </q-page>
    </q-page-container>

    <q-footer ref="footer" reveal elevated revel-offset="500">
      <footer-navs class="full-width scroll" />
    </q-footer>
  </q-layout>
</template>
<script>
import { openURL } from 'quasar'
import LeftSidebar from './LeftSidebar'
import FooterNavs from 'src/components/FooterNavs'
import meta from 'src/utils/meta'
export default {
  name: 'MyLayout',
  components: { LeftSidebar, FooterNavs },
  data () {
    return {
      metaTags: {
        title: 'Waelio.com',
        description:
          'Personal Portfolio Website with current projects, links to previous projects. Contact US page as well as support page for other online projects. Welcome Friends.'
      },
      user: '',
      footer_height: 100,
      signedIn: 'false',
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  },
  meta,
  computed: {
    isLoggedIn () {
      return this.signedIn
    }
  },
  mounted () {
    this.$AmplifyEventBus.$on('authState', info => {
      this.signedIn = true
    })
  },
  beforeCreate () {
    this.$Auth
      .currentAuthenticatedUser()
      .then(user => {
        this.user = user
        this.signedIn = true
      })
      .catch(() => {
        this.signedIn = false
      })
  },
  methods: {
    openURL,
    setFooterHeight () {
      const footerElement = this.$refs.footer
      console.log(footerElement)
    },
    async signOut () {
      await this.$Auth
        .signOut()
        .then(data => console.log(data))
        .catch(err => console.log(err))
      this.signedIn = false
      parent.signedIn = false
      this.$router.push('/auth/authenticate')
    }
  }
}
</script>

<style></style>
