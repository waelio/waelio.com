<template>
  <div class="aws-auth shadow-4">
    <div
      class="full-width column no-wrap justify-evenly items-stretch content-between"
    >
      <div class="text-center q-py-sm q-my-sm bg-red text-white">
        This site is under continues developments!<q-spinner-gears
          class="q-mx-sm"
          size="2rem"
          color="primary"
        />
      </div>
      <div v-if="!signedIn" class="text-center q-py-sm bg-warning text-white">
        You are signed out.
      </div>
      <div v-else class="text-center q-py-sm bg-green text-white">
        Hello, {{ User.username }}
      </div>
      <q-btn
        v-if="signedIn"
        color="warning"
        class="q-my-sm"
        style
        icon="exit"
        label="Signout"
        @click.prevent="signOut()"
      />
      <amplify-authenticator class="aws-auth second">
        <amplify-sign-out></amplify-sign-out>
      </amplify-authenticator>
    </div>
    <q-separator v-if="!signedIn" inset spaced size="20" />
    <div
      v-if="!signedIn"
      class="full-width row no-wrap justify-evenly items-center content-around"
    >
      <q-btn
        color="primary"
        @Click.prevent="() => $Auth.federatedSignIn({ provider: 'Facebook' })"
        >Facebook</q-btn
      >
      <q-btn
        color="red"
        @Click.prevent="() => $Auth.federatedSignIn({ provider: 'Google' })"
        >Google</q-btn
      >
      <q-btn color="info" label="AuthO" @click.prevent="openUI"></q-btn>
    </div>
    <pre>{{ tempData }}</pre>
  </div>
</template>
<script>
/* eslint-disable no-unused-vars */
import Amplify, { Auth, Hub } from 'aws-amplify'
import awsconfig from 'src/aws-exports'
Amplify.configure(awsconfig)
import {
  CognitoIdToken,
  CognitoAccessToken,
  CognitoRefreshToken,
  CognitoUserSession
} from 'amazon-cognito-identity-js'
import { mapActions, mapGetters, mapState } from 'vuex'
import { openURL } from 'quasar'
export default {
  name: 'auth',
  mounted () {
    const { code } = this.$route.query
    let token = window.location.hash.replace(/^#/, '') || false
    if (token) {
      token = this.QueryStringToJSON(token)
      this.handleResponse(token)
    }
    if (code) {
      console.log('code', code)
    }
  },
  data () {
    return {
      isLocalhost: Boolean(
        window.location.hostname === 'localhost' ||
          window.location.hostname === '[::1]' ||
          window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
          )
      ),
      tempData: null,
      formsStates: [
        'SignIn',
        'SignUp',
        'ForgotPassword',
        'ChangePassword',
        'VerifyEmail'
      ],
      authState: 'SignIn',
      isLoading: false,
      customState: null,
      codeUrl:
        'https://auth.waelio.com/login?client_id=1ad0455rde18h4dorn5q96njvh&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com',
      tokenUrl:
        'https://auth.waelio.com/login?client_id=1ad0455rde18h4dorn5q96njvh&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com'
    }
  },
  methods: {
    ...mapActions({
      signOut: 'LocalUser/signOut'
    }),
    oopenURL: async url => {
      try {
        const result = await Auth.AuthSession.startAsync({
          authUrl: this.buildUrl
        })
        this.getTokenbyCode(result.params.code)
      } catch (openURLError) {
        console.log(`openURLError: ${openURLError}`)
      }
    },
    openUI () {
      openURL(this.buildUrl, null, {
        noopener: true,
        menubar: false,
        toolbar: false,
        noreferrer: true
      })
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
      const expiresAt = expiresIn * 1000 + new Date().getTime()
      this.isLoading = true

      try {
        const response = await Auth.federatedSignIn(
          'facebook',
          { token, expiresAt },
          { user: 'wahbehw@gmail.com' }
        )
        this.isLoading = false
        this.props.onLogin(response)
      } catch (e) {
        this.isLoading = false
        console.log('error', e)
      }
    },
    getTokenbyCode: async code => {
      const details = {
        grant_type: 'authorization_code',
        code,
        client_id: awsconfig.aws_user_pools_web_client_id,
        redirect_uri: Auth.AuthSession.getRedirectUrl()
      }
      const formBody = Object.keys(details)
        .map(
          key =>
            `${encodeURIComponent(key)}=${encodeURIComponent(details[key])}`
        )
        .join('&')

      try {
        const res = await fetch('https://auth.waelio.com/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: formBody
        })
        const tokenRequestJson = await res.json()
        const IdToken = new CognitoIdToken({
          IdToken: tokenRequestJson.id_token
        })
        const AccessToken = new CognitoAccessToken({
          AccessToken: tokenRequestJson.access_token
        })
        const RefreshToken = new CognitoRefreshToken({
          RefreshToken: tokenRequestJson.refresh_token
        })
        try {
          const userSession = new CognitoUserSession({
            IdToken,
            AccessToken,
            RefreshToken
          })

          const userData = {
            Username: IdToken.payload['cognito:username'],
            Pool: awsconfig.aws_user_pools_id
          }
          const authUser = Auth.createCognitoUser(userData.Username) // THIS NOW WORKS
          const authSession = await Auth.userSession(authUser)
          const authCurrentUser = Auth.currentAuthenticatedUser()
        } catch (userError) {
          // HANDLE USERERROR
        }
      } catch (fetchError) {
        console.error(fetchError)
      }
    }
  },
  computed: {
    ...mapGetters('LocalUser', ['User', 'signedIn']),
    buildUrl () {
      return `https://auth.waelio.com/login?response_type=code&client_id=${awsconfig.aws_user_pools_web_client_id}&redirect_uri=${this.callBackURL}`
    },
    callBackURL () {
      return this.isLocalhost
        ? 'http://localhost:8080/'
        : 'https://waelio.com/'
    }
  }
}
</script>
<style lang="scss">
.aws-auth {
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  max-width: 700px;
}
body.screen--xs .aws-auth {
  padding: 16px;
  width: 100%;
  overflow-x: scroll;
}
body.screen--xs .aws-auth.second * {
  margin-left: 0px;
  display: flex;
  flex-direction: column;
  width: 300px;
  height: fit-content;
  padding: 0.3rem 0;
  margin-bottom: 1px;
  text-align: left;
  text-indent: 5px;
  border-radius: 4px;
  margin-right: 0;
}
body.screen--sm .aws-auth {
  margin-left: auto;
  margin-right: auto;
  padding: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
}
body.screen--sm .aws-auth.second * {
  margin-left: auto;
  margin-right: auto;
}
body.screen--md .aws-auth {
  margin-left: auto;
  margin-right: auto;
  padding: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
}
body.screen--md .aws-auth.second * {
  margin-left: auto;
  margin-right: auto;
}
body.screen--lg .aws-auth {
  margin-left: auto;
  margin-right: auto;
  padding: 16px;
  width: 100%;
}
body.screen--lg .aws-auth.second * {
  margin-left: auto;
  margin-right: auto;
}
</style>
