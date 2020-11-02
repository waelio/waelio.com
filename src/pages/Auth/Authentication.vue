<template>
    <div class="auth">
    <q-btn color="info" label="Open UI" @click.prevent="openUI"></q-btn>
    <amplify-authenticator class="q-mt-md" username-alias="email"></amplify-authenticator>
    <div class="flex justify-between">
      <q-btn color="primary" @click.prevent="fbLogin">Login with Facebook</q-btn>
      <q-btn color="red" @click.prevent="glLogin">Login with Google</q-btn>
    </div>
  </div>
</template>
<script>
import { Auth, OAuth } from 'aws-amplify'
import { openURL } from 'quasar'
export default {
  name: 'auth',
  props: ['isLoggedIn', 'signOut'],
  mounted () {
    const code = this.$route.query.code
    if (code) {
      try {
        OAuth._handleCodeFlow(code)
      } catch (error) {
        console.error(error)
      }
      const newHeader = {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
      this.$axios.get(`auth.waelio.com/oauth/${code}`, newHeader)
        .then(resonse => {
          console.log(resonse)
        })
        .catch(exception => {
          console.log(exception)
        })
    }
    Auth.currentAuthenticatedUser()
      .then(user => { this.user = user })
      .catch((e) => {
        this.$notification.error(e)
        console.log('Not signed in', e)
      })
  },
  data () {
    return {
      user: null,
      customState: null
    }
  },
  methods: {
    openUI () {
      openURL(
        'https://portfolio357ad254-357ad254-dev.auth.us-east-1.amazoncognito.com/login?client_id=2erlvso7q5ufgss3cl2c0acerv&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/auth',
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
        this.$notification.error(error)
        console.error(error)
      }
    },
    async glLogin () {
      try {
        await Auth.federatedSignIn({ provider: 'Google' })
      } catch (error) {
        this.$notification.error(error)
        console.error(error)
      }
    }
  }
}
</script>
