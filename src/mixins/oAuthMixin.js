/* eslint-disable camelcase */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
import { mapGetters } from 'vuex'
import awsconfig from 'src/aws-exports'
import { Auth } from 'aws-amplify'
import { openURL } from 'quasar'
import { CognitoIdToken, CognitoAccessToken, CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js'
export default {
  mounted () {
    console.log('mounted', this.$route.query)
  },
  updated () {
    console.log('updated', this.$route.query)
    const { code } = this.$route.query
    let token = window.location.hash.replace(/^#/, '') || false
    if (token) {
      token = this.QueryStringToJSON(token)
      this.handleResponse(token)
    }
    if (code) {
      console.log('code', code)
      this.handleResponse(code)
    }
  },
  data () {
    return {
      reWrite: '</^((?!.(xml|map|css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|json|mov|pdf|xml)$).)*$/>',
      /* authUrlSimple: 'https://auth.waelio.com', */
      authUrlSimple: 'https://auth.waelio.com',
      authUrlClean: 'https://auth.waelio.com/oauth2/',
      authUrlToken: 'https://auth.waelio.com/oauth2/token',
      authUrlAuthorize: 'https://auth.waelio.com/oauth2/authorize',
      XCsrfToken: 'i8XNjC4b8KVok4uw5RftR38Wgp2BFwql'
    }
  },
  methods: {
    buildAuthURL (code) {
      return {
        grant_type: 'client_credentials',
        client_id: awsconfig.aws_user_pools_web_client_id,
        redirect_uri: this.callBackURL,
        code: code,
        state: this.XCsrfToken,
        scope: 'aws.cognito.signin.user.admin+email+openid+phone+profile'
      }
    },
    async getTokenByCode (code) {
      // grant_type: 'authorization_code',

      // const formBody = Object.keys(details)
      //   .map(
      //     key =>
      //       `${encodeURIComponent(key)}=${encodeURIComponent(details[key])}`
      //   )
      //   .join('&')
      // console.log(details)
      // const { proxy } = this.proxy
      // const config = {
      //   headers: {
      //     'Access-Control-Allow-Origin': 'http://localhost:8080',
      //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      //   }
      // }
      try {
        // const link = this.authUrl(code)
        openURL(`${this.authUrlAuthorize}?grant_type:authorization_code&code=${code}&client_id=${awsconfig.aws_user_pools_web_client_id}&state=${this.XCsrfToken}&redirect_uri=${this.callBackURL}`, null, {
          noopener: true,
          menubar: true,
          toolbar: true,
          noreferrer: false
        })
        return
        // eslint-disable-next-line no-unreachable
        const res = {}
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
          console.error(userError)
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
        noopener: false,
        menubar: false,
        toolbar: false,
        noreferrer: false
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
    async handleResponse (code) {
      this.isLoading = true
      const payload = this.buildAuthURL(code)
      console.log(payload)
      const formBody = Object.keys(payload)
        .map(
          key =>
            `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`
        )
        .join('&')
      console.log(formBody)
      const cb = this.callBackURL
      const response = await this.$axios({
        url: this.authUrlToken,
        method: 'POST',
        data: formBody,
        headers: {
          'Access-Control-Allow-Origin': cb,
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic aSdxd892iujendek328uedj'
        }
      })
        .then(good => {
          console.log(good)
        })
        .catch(exp => {
          console.error(exp)
        })

      this.isLoading = false
    },
    authUrl (code) {
      return `${this.authUrlAuthorize}?grant_type:authorization_code&code=${code}&client_id=${awsconfig.aws_user_pools_web_client_id}&state=${this.XCsrfToken}&redirect_uri=${this.callBackURL}`
    },
    authTokenUrl (token) {
      return `${this.authUrlAuthorize}?grant_type:authorization_code&token=${token}&client_id=${awsconfig.aws_user_pools_web_client_id}&state=${this.XCsrfToken}&redirect_uri=${this.callBackURL}`
    },
    authCodeUrl (code) {
      return `${this.authUrlAuthorize}?grant_type:authorization_code&code=${code}&client_id=${awsconfig.aws_user_pools_web_client_id}&state=${this.XCsrfToken}&redirect_uri=${this.callBackURL}`
    }
  },
  computed: {
    ...mapGetters('LocalUser', ['User', 'signedIn']),
    buildUrl () {
      return decodeURIComponent(encodeURIComponent(`${this.authUrlSimple}/login?client_id=${awsconfig.aws_user_pools_web_client_id}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&state=${this.XCsrfToken}&redirect_uri=${this.callBackURL}`))
    },
    callBackURL () {
      return decodeURIComponent(encodeURIComponent(this.isLocalhost
        ? 'http://localhost:8080'
        : this.hostName))
    },
    hostName () {
      return decodeURIComponent(encodeURIComponent(window && window.location.origin))
    },
    proxy () {
      return {
        proxy: {
          protocol: window && window.location.protocol,
          host: window && window.location.host,
          port: window && window.location.port
        }
      }
    }
  }
}
