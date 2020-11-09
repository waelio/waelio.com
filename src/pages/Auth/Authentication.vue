<template>
    <div class="auth q-pa-md">
    <amplify-authenticator class="q-mt-md" username-alias="email"></amplify-authenticator>
    <div class="flex justify-between">
      <q-btn color="primary" @Click.prevent="()=>$Auth.federatedSignIn({provider: 'Facebook'})">Facebook</q-btn>
      <q-btn color="red"     @Click.prevent="()=>$Auth.federatedSignIn({provider: 'Google'})">Google</q-btn>
      <q-btn color="info" label="Open UI" @click.prevent="openUI"></q-btn>
    </div>
    <pre>{{user}}</pre>
    <pre>{{tempData}}</pre>
  </div>
</template>
<script>
import Amplify, { Auth, Hub } from 'aws-amplify'
import awsconfig from 'src/aws-exports'
Amplify.configure(awsconfig)
// import { DataStore, Predicates } from '@aws-amplify/datastore'

import { openURL } from 'quasar'
export default {
  name: 'auth',
  props: ['isLoggedIn', 'signOut'],
  mounted () {
    const { code } = this.$route.query
    let token = window.location.hash.replace(/^#/, '') || false
    if (token) {
      token = this.QueryStringToJSON(token)
      this.handleResponse(token)
    }
    if (code) {
      // console.log('code', code)
    }
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          this.user = data
          break
        case 'signOut':
          this.user = null
          break
        case 'customOAuthState':
          this.customState = data
      }
    })
    this.$AmplifyEventBus.$on('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          this.user = data
          break
        case 'signOut':
          this.user = null
          break
        case 'customOAuthState':
          this.customState = data
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
      tempData: null,
      user: null,
      isLoading: false,
      customState: null,
      codeUrl: 'https://auth.waelio.com/login?client_id=1ad0455rde18h4dorn5q96njvh&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/auth/process',
      tokenUrl: 'https:/auth.waelio.com/login?client_id=1ad0455rde18h4dorn5q96njvh&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/auth/process'
    }
  },
  methods: {
    openUI () {
      openURL(
        this.tokenUrl,
        null,
        {
          noopener: true,
          menubar: false,
          toolbar: false,
          noreferrer: true
        }
      )
    },
    async fbLogin () {
      try {
        await this.$Auth.federatedSignIn({ provider: 'Facebook' })
      } catch (error) {
        console.error(error)
      }
    },
    async glLogin () {
      try {
        await this.$Auth.federatedSignIn({ provider: 'Google' })
      } catch (error) {
        console.error(error)
      }
    },
    QueryStringToJSON (query) {
      var pairs = query.slice(1).split('&')
      var result = {}
      pairs.forEach(pair => {
        pair = pair.split('=')
        result[pair[0]] = decodeURIComponent(pair[1] || '')
      })
      return JSON.parse(JSON.stringify(result))
    },
    async handleResponse (data) {
      this.tempData = data
      // eslint-disable-next-line camelcase
      const { access_token: token, expires_in: expiresIn } = data
      // console.log('access_token', token)
      // console.log('expiresIn', expiresIn)
      const expiresAt = expiresIn * 1000 + new Date().getTime()
      // console.log(expiresAt)
      // const user = { email }

      this.isLoading = true

      try {
        const response = await Auth.federatedSignIn(
          'facebook',
          { token, expiresAt }, { user: 'wahbehw@gmail.com' }
        )
        this.isLoading = false
        this.props.onLogin(response)
      } catch (e) {
        this.isLoading = false
        console.log('error', e)
      }
    }
  }
}
</script>
