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
  props: [],
  mounted () {
    const code = this.$route.query.code
    if (code) {
      try {
        OAuth._handleCodeFlow(code)
      } catch (error) {
        console.error(error)
      }
      this.$axios.get(`https://auth.waelio.com/oauth/${code}`)
        .then(resonse => {
          console.log(resonse)
        })
        .catch(exception => {
          console.log(exception)
        })
    }
    Auth.currentAuthenticatedUser()
      .then(user => this.setState({ user }))
      .catch((e) => {
        this.$notification.error(e.message)
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
<style>
.error {
  background-color: red;
  color: white;
  font-weight: bold;
  font-size: 1.4 rem;
  text-align: center;
  padding: 5px 2px;
  margin-top: 5px;
}
</style>
<style scoped>
.auth {
  margin: 0 auto;
  width: 460px;
}
.toggle {
  cursor: pointer;
  font-size: 18px;
}
* {
  box-sizing: border-box;
}
.authButton {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #2196f3;
  border: none;
  color: white;
  outline: none;
}
.button {
  cursor: pointer;
}
.button:hover {
  opacity: 0.5;
}
.text {
  margin-top: 4px;
  margin-bottom: 0px;
}
.delete {
  color: #2196f3;
}
.todo {
  display: block;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  text-align: center;
  padding-top: 8px;
  padding-bottom: 9px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
