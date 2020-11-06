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
        <q-toolbar-title><router-link class="text-white text-sm" to="/">Waelio.com</router-link></q-toolbar-title>
        <q-btn text-color="white"  dense icon="ring_volume" @click.prevent="pingAll()" />
        <q-space />
        <q-btn-dropdown stretch flat label="Notifications">
          <q-list>
            <q-item-label header>{{$t('Messages')}}</q-item-label>
            <q-item v-for="message in messages" :key="message.id" clickable v-close-popup tabindex="0">
              <q-item-section avatar>
                <q-avatar size="md" icon="notification_important" color="secondary" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{message.message}}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="delete" @click.passive="deleteNotification(message)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-separator dark vertical />
        <q-btn stretch flat :label="$q.version" />
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
import { DataStore } from '@aws-amplify/datastore'
import { Chatty } from 'src/models'

export default {
  name: 'MyLayout',
  components: { LeftSidebar, FooterNavs },
  props: ['messages'],
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
  async mounted () {
    this.$AmplifyEventBus.$on('authState', info => {
      this.signedIn = true
    })
  },
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
  methods: {
    async deleteNotification (message) {
      // const message = await DataStore.query(Post, "1234567");
      await DataStore.delete(message)
    },
    async pingAll () {
      await DataStore.save(new Chatty({
        user: 'amplify-user',
        message: 'Hi everyone!',
        createdAt: new Date().toISOString()
      }))
    },
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
  },
  computed: {
    isLoggedIn () {
      return this.signedIn
    }
  }
}
</script>

<style></style>
