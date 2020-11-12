/* eslint-disable no-unused-vars */
import { mapGetters } from 'vuex'
import awsconfig from 'src/aws-exports'
import { Auth } from 'aws-amplify'
import { openURL } from 'quasar'

import {
  CognitoIdToken,
  CognitoAccessToken,
  CognitoRefreshToken,
  CognitoUserSession
} from 'amazon-cognito-identity-js'
export default {
  data () {
    return {
      authUrlClean: 'https://auth.waelio.com/oauth2/authorize',
      authUrlAuthorize: 'https://auth.waelio.com/oauth2/authorize',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    }
  },
  mounted () {
    const { code } = this.$route.query
    if (code) {
      console.log('code', code)
      this.getTokenByCode(code)
    }
  },
  methods: {
    async getTokenByCode (code) {
      // grant_type: 'authorization_code',
      const details = {
        grant_type: 'authorization_code',
        code,
        client_id: awsconfig.aws_user_pools_web_client_id,
        redirect_uri: this.authUrlClean
      }
      const formBody = Object.keys(details)
        .map(
          key =>
            `${encodeURIComponent(key)}=${encodeURIComponent(details[key])}`
        )
        .join('&')

      try {
        const res = await this.$axios({
          method: 'post',
          url: this.authUrlAuthorize,
          data: formBody,
          headers: this.headers
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
    },
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
    }
  },
  computed: {
    ...mapGetters('LocalUser', ['User', 'signedIn']),
    buildUrl () {
      return `https://auth.waelio.com/login?response_type=code&client_id=${awsconfig.aws_user_pools_web_client_id}&redirect_uri=${this.callBackURL}`
    },
    callBackURL () {
      return this.isLocalhost
        ? 'http://localhost:8080'
        : this.hostName
    },
    hostName () {
      return window.location.host
    }
  }

}
