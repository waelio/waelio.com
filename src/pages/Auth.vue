<template>
  <div class="auth">
    <amplify-authenticator class="q-mt-md" username-alias="email"></amplify-authenticator>
    <q-btn @click="fbLogin">Open Facebook</q-btn>
  </div>
</template>
<script>
import { Auth, Hub } from 'aws-amplify'
export default {
  name: 'auth',
  props: [],
  mounted () {
    const code = this.$route.query.code
    if (code) {
      // Auth.authenticate(code)
    }
    Hub.listen('auth', ({ payload: { event, data } }) => {
      console.log(event)
      switch (event) {
        case 'signIn':
          this.user = data
          break
        case 'signOut':
          this.user = null
          break
        case 'customAuthState':
          this.customState = data
      }
    })
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
    async fbLogin () {
      try {
        await Auth.federatedSignIn({ provider: 'Facebook' })
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
