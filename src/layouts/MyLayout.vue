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
        <q-btn text-color="white"  v-if="signedIn"  dense icon="ring_volume" @click.prevent="pingAll" />
        <q-space />
        <q-btn-dropdown persistent v-if="messages.length"  v-model="dropDown" stretch flat >
          <template v-slot:label>
            <q-badge color="orange">{{messages.length}}</q-badge>
            <span class="q-mx-xs">Notifications</span>
          </template>
          <q-list>
            <q-item-label header>{{$t('Messages')}}</q-item-label>
            <q-item v-for="message in messages" :key="message.id" clickable v-close-popup tabindex="0">
              <q-item-section avatar>
                <q-avatar size="md" icon="notification_important" color="secondary" text-color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{message.message}}</q-item-label>
                <q-item-label><div>{{ message.user}} - {{ formatDate (message) }})</div></q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="delete" @click.prevent="deleteNotification(message)" />
              </q-item-section>
            </q-item>
                          <q-select
                  class="no-padding"
                  dense
                  id="special-select"
                  borderless
                  hide-dropdown-icon
                  item-aligned
                  label-color="white"
                  :label="$i18n.locale.name || 'Englisg'"
                  hide-selected
                  v-model="$i18n.locale"
                  :options-value="item => item.value"
                  :option-label="item => item.name"
                  standout
                  :options="[
                    { value: 'en-us', name: 'English' },
                    { value: 'ar-ps', name: 'Arabic' },
                    { value: 'he-il', name: 'Hebrew' }
                  ]"
                >
                  <template v-slot:label>
                    <div class="text-center">
                      {{ $i18n.locale.name || "English" }}
                    </div>
                  </template>
                </q-select>
          </q-list>
        </q-btn-dropdown>
        <q-separator dark vertical />
        <q-btn stretch flat :label="$q.version" />
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <left-sidebar :isLoggedIn="isLoggedIn" @signOut="signOut" />
    </q-drawer>
    <q-page-container class="no-padding">
      <q-page>
        <router-view :isLoggedIn="isLoggedIn" class="q-mx-auto" />
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

import moment from 'moment'
import { openURL } from 'quasar'
import LeftSidebar from './LeftSidebar'
import FooterNavs from './FooterNavs'
import meta from 'src/utils/meta'
import { Chatty } from 'src/models'
import { DataStore, Predicates } from '@aws-amplify/datastore'
import { notifyMe } from 'src/utils/notify'

export default {
  name: 'MyLayout',
  components: { LeftSidebar, FooterNavs },
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
  created () {
    this.subscription = DataStore.observe(Chatty).subscribe(msg => {
      notifyMe(msg.message)
      this.loadMessages()
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
      subscription: undefined,
      user: '',
      messages: [],
      footer_height: 100,
      signedIn: false,
      dropDown: false,
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  },
  meta,
  methods: {
    moment: () => moment(),
    loadMessages () {
      DataStore.query(Chatty, Predicates.ALL).then(messages => {
        this.messages = messages
      })
    },
    formatDate (message) {
      return moment(message.createdAt).format('DD/MM/YY HH:mm:ss')
    },
    async deleteNotification (message) {
      this.dropDown = true
      DataStore.delete(message).then(async () => {
        this.messages = await DataStore.query(Chatty, Predicates.ALL)
        this.dropDown = false
      })
    },
    async pingAll () {
      await DataStore.save(new Chatty({
        user: 'Wael Wahbeh',
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
  },
  destroyed () {
    if (!this.subscription) return
    this.subscription.unsubscribe()
  }
}
</script>

<style></style>
