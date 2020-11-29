/* eslint-disable camelcase */
import { mapGetters } from 'vuex'
import awsconfig from 'src/aws-exports'
import { Auth } from 'aws-amplify'
import { openURL, uid } from 'quasar'
import { sha256 } from 'js-sha256'
const Buffer = require('buffer/').Buffer
import {
  JSONToQueryString, QueryStringToJSON, snakeToCamel,
  decodePayload, Base64, calculateClockDrift
} from 'src/utils/tools'
import { CognitoIdToken, CognitoAccessToken, CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js'
export default {
  mounted () {
    console.log('mounted', this.$route.query)
  },
  updated () {
    const { code } = this.$route.query

    if (code) {
      console.log('code', code)
      return this.getTokenByCode(code)
    }
    let token = window.location.hash.replace(/^#/, '') || false
    if (token) {
      token = QueryStringToJSON(token)
      return this.handleResponse(token)
    }
  },
  data () {
    return {
      reWrite: '</^((?!.(xml|map|css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|json|mov|pdf|xml)$).)*$/>',
      authUrlSimple: 'https://auth.waelio.com',
      authUrlClean: 'https://auth.waelio.com/oauth2/',
      authUrlToken: 'https://auth.waelio.com/oauth2/token',
      authUrlAuthorize: 'https://auth.waelio.com/oauth2/authorize',
      scope: 'aws.cognito.signin.user.admin+email+openid+phone+profile'
    }
  },
  methods: {
    async getTokenByCode (code) {
      try {
        this.isLoading = true
        this.$router.replace('/')
        let data = this.buildAuthBody(code)
        data = JSONToQueryString(data)
        const encodedId = Buffer.from(awsconfig.aws_user_pools_web_client_id, 'base64')

        const options = {
          headers: {
            Accept: 'Content-Type:application/json',
            'Access-Control-Allow-Origin': this.callBackURL,
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedId}`
          }
        }
        await this.$axios({
          url: this.authUrlToken,
          method: 'POST',
          data,
          options
        })
          .then(res => JSON.stringify(res))
          .then(res => JSON.parse(res))
          .then(async data => {
            console.log('data', data)
            if (data && data.data.refresh_token && data.data.id_token && data.data.access_token) {
              const tokenRequestJson = data.data
              console.log('tokenRequestJson', tokenRequestJson)

              const idTokenData = await decodePayload(await tokenRequestJson.id_token)
              console.log('idTokenData', await idTokenData)

              const accessTokenData = await decodePayload(await tokenRequestJson.access_token)
              console.log('accessTokenData', await accessTokenData)

              const refreshTokenData = await tokenRequestJson.refresh_token
              // refreshTokenData = await decodePayload(await tokenRequestJson.refresh_token, true)
              console.log('refreshTokenData', await refreshTokenData)

              // value.replace(/(.*?)(?=\|)/, "")

              for (const [key, value] of Object.entries(tokenRequestJson)) {
                window.localStorage.setItem(snakeToCamel(key + 'Key'), await JSON.stringify(decodePayload(value)))
              }
              this.$q.localStorage.set(`CognitoIdentityServiceProvider.${awsconfig.aws_user_pools_web_client_id}.LastAuthUser`, idTokenData['cognito:username'])
              this.$q.localStorage.set(`CognitoIdentityServiceProvider.${awsconfig.aws_user_pools_web_client_id}.${idTokenData['cognito:username']}.idToken`, idTokenData)
              this.$q.localStorage.set(`CognitoIdentityServiceProvider.${awsconfig.aws_user_pools_web_client_id}.${idTokenData['cognito:username']}.accessToken`, accessTokenData)
              this.$q.localStorage.set(`CognitoIdentityServiceProvider.${awsconfig.aws_user_pools_web_client_id}.${idTokenData['cognito:username']}.refreshToken`, tokenRequestJson.refresh_token)
              this.$q.localStorage.set(`CognitoIdentityServiceProvider.${awsconfig.aws_user_pools_web_client_id}.${idTokenData['cognito:username']}.clockDrift`, calculateClockDrift(accessTokenData.iat, idTokenData.iat))
              Auth.currentAuthenticatedUser({
                bypassCache: true
              })

              const IdToken = new CognitoIdToken({
                IdToken: idTokenData
              })
              const AccessToken = new CognitoAccessToken({
                AccessToken: accessTokenData
              })
              const RefreshToken = new CognitoRefreshToken({
                RefreshToken: refreshTokenData
              })
              try {
                const userSession = new CognitoUserSession({
                  IdToken,
                  AccessToken,
                  RefreshToken
                })
                const cognitoUsername = idTokenData['cognito:username']
                const userData = {
                  Username: cognitoUsername,
                  Pool: awsconfig.aws_user_pools_web_client_id
                }

                console.log('userSession', userSession)
                console.log('userData', userData)
                const authUser = Promise.resolve(Auth.createCognitoUser(userData.Username)) // THIS NOW WORKS
                console.log('authUser', await authUser)
                const authSession = Promise.resolve(Auth.userSession(authUser))
                console.log('authSession', await authSession)
                const authCurrentUser = Promise.resolve(Auth.currentAuthenticatedUser())
                console.log('authCurrentUser', await authCurrentUser)
              } catch (userError) {
                console.error(userError)
              }
              Auth.currentUserInfo()
                .then(res => {
                  console.log('res', JSON.stringify(res))
                  console.log('User signed in - Check the logs')
                })
                .catch((err) => {
                  console.error('err', err)
                })
            }
          }, fetchError => {
            console.error(fetchError)
          })
          .catch(exp => {
            console.error(exp)
          })
      } catch (err) {
        console.log(err)
      }
    },
    openUI () {
      const temp = uid()
      this.CSRF_TOKEN = temp
      openURL(this.loginUrlBuilder('code'), {
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
    buildAuthBody (code) {
      return {
        grant_type: 'authorization_code',
        client_id: awsconfig.aws_user_pools_web_client_id,
        code,
        code_verifier: sha256(code),
        scope: this.scope,
        state: this.CSRF_TOKEN,
        redirect_uri: this.callBackURL
      }
    },
    XhandleResponse (code) {
      this.isLoading = true
      this.$router.replace('/')
      let data = this.buildAuthBody(code)
      data = JSONToQueryString(data)
      const encodedId = Base64(awsconfig.aws_user_pools_web_client_id)

      const options = {
        headers: {
          'Access-Control-Allow-Origin': this.callBackURL,
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedId}`
        }
      }
      this.$axios({
        url: this.authUrlToken,
        method: 'POST',
        data,
        options
      })
        .then(good => {
          // value.replace(/(.*?)(?=\|)/, "")
          for (const [key, value] of Object.entries(good.data)) {
            this.$q.localStorage.set(snakeToCamel(key), value)
          }
          this.$q.localStorage.set('CognitoIdentityServiceProvider.1ad0455rde18h4dorn5q96njvh.LastAuthUser', 'waelio')
          this.$q.localStorage.set('CognitoIdentityServiceProvider.1ad0455rde18h4dorn5q96njvh.waelio.idToken', good.data.['id-token'])
          this.$q.localStorage.set('CognitoIdentityServiceProvider.1ad0455rde18h4dorn5q96njvh.waelio.accessToken', good.data.['access-token'])
          this.$q.localStorage.set('CognitoIdentityServiceProvider.1ad0455rde18h4dorn5q96njvh.waelio.refreshToken', good.data.['refresh-token'])
          Auth.currentAuthenticatedUser({
            bypassCache: true // If set to true, this call will send a request to Cognito to get the latest user data
          })
          this.isLoading = false
        })
        .catch(exception => {
          console.error(exception)
        })
    },
    loginUrlBuilder (type = 'code', payload) {
      const url = `${this.authUrlSimple}/login`,
        client_id = awsconfig.aws_user_pools_web_client_id,
        response_type = type,
        scope = this.scope,
        state = this.state,
        redirect_uri = this.callBackURL
      return `${url}?client_id=${client_id}&response_type=${response_type}&state=${state}&scope=${scope}&redirect_uri=${redirect_uri}`
    }
  },
  computed: {
    ...mapGetters('LocalUser', ['User', 'signedIn']),
    callBackURL () {
      return this.isLocalhost
        ? 'http://localhost:8080'
        : this.hostName
    },
    CSRF_TOKEN: {
      get: function () { return this.$q.cookies.get('CSRF_TOKEN') },
      set: function (value) {
        if (this.$q.cookies.has('CSRF_TOKEN')) {
          this.$q.cookies.remove('CSRF_TOKEN')
        }
        this.$q.cookies.set('CSRF_TOKEN', value, {
          secure: window && window.location.protocol[4] === 's',
          expires: '60m 0s',
          domain: window && window.location.hostname,
          path: '/',
          hostOnly: true,
          httpOnly: false,
          sameSite: 'Strict'
        })
        return this.$q.cookies.get('CSRF_TOKEN')
      }
    },
    hostName () {
      return window && window.location.origin
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
