<template>
    <div class="auth">
    <q-btn color="info" label="Open UI" @click.prevent="openUI"></q-btn>
    <amplify-authenticator class="q-mt-md" username-alias="email"></amplify-authenticator>
    <div class="flex justify-between">
      <q-btn color="primary" @Click="() => Auth.federatedSignIn({provider: 'Facebook'})">Login with Facebook</q-btn>
      <q-btn color="red" @click.prevent="glLogin">Login with Google</q-btn>
    </div>
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

    Auth.currentAuthenticatedUser()
      .then(user => { this.user = user })
      .catch((e) => {
        console.log('Not signed in', e)
      })
  },
  data () {
    return {
      user: null,
      isLoading: false,
      customState: null,
      codeUrl: 'https://auth.waelio.com/login?client_id=1ad0455rde18h4dorn5q96njvh&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/auth/authenticate',
      tokenUrl: 'https://auth.waelio.com/login?client_id=1ad0455rde18h4dorn5q96njvh&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/auth/authenticate'
    }
  },
  methods: {
    openUI () {
      openURL(
        this.codeUrl,
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
        await Auth.federatedSignIn({ provider: 'Facebook' })
      } catch (error) {
        console.error(error)
      }
    },
    async glLogin () {
      try {
        await Auth.federatedSignIn({ provider: 'Google' })
      } catch (error) {
        console.error(error)
      }
    },
    async handleResponse (data) {
      const { email, accessToken: token, expiresIn } = data
      const expiresAt = expiresIn * 1000 + new Date().getTime()
      console.log(expiresAt)
      const user = { email }

      this.isLoading = true

      try {
        const response = await Auth.federatedSignIn(
          'facebook',
          { token, expiresAt },
          user
        )
        this.isLoading = false
        this.props.onLogin(response)
      } catch (e) {
        this.isLoading = false
        this.handleError(e)
      }
    }
  }
}
</script>
