<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
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
          <router-link
            :to="{ name: 'shoppinglists' }"
            tag="span"
            style="cursor: pointer"
          >
            <q-toolbar-title>
              <router-link class="text-white text-sm" to="/">
                Waelio.com</router-link
              ></q-toolbar-title
            >
          </router-link>

          <div class="fixed-right q-pr-xs full-height">v{{ $q.version }}</div>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <left-sidebar :isLoggedIn="isLoggedIn" @signOut="signOut" />
    </q-drawer>

    <q-page-container>
      <router-view :isLoggedIn="isLoggedIn" class="q-mx-auto slitter" />
    </q-page-container>
    <q-footer reveal elevated bordered>
      <footer-navs class="q-mx-auto q-px-xs scroll" />
      <p class="text-white text-center text-h6">
        {{$t('All rights reserved')}} &copy;Waelio 2020
      </p>
    </q-footer>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import LeftSidebar from './LeftSidebar'
import FooterNavs from 'src/components/FooterNavs'
export default {
  name: 'MyLayout',
  components: { LeftSidebar, FooterNavs },
  data () {
    return {
      user: '',
      signedIn: 'false',
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  },
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
