<template>
  <div class="auth">
    <q-btn class="full-width" @Click="()=>Auth.federatedSignIn({ provider: 'Facebook' })" label="Open Facebook" />
    <q-btn class="full-width" @Click="()=>Auth.federatedSignIn({ provider: 'Google' })" label="Open Google" />
    <q-btn class="full-width" @Click="()=>Auth.federatedSignIn()" label="Open Hosted UI" />
    <q-btn class="full-width" @Click="()=>Auth.signOut()" label="Sign Out {user.getUsername()}" />
    <amplify-authenticator class="q-mt-md" username-alias="email"></amplify-authenticator>
  </div>
</template>
<script>

import { Auth, Hub } from 'aws-amplify'
export default {
  name: 'auth',
  props: [],
  mounted () {
    Hub.listen('auth', ({ payload: { event, data } }) => {
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
      .catch(() => console.log('Not signed in'))
  },
  data () {
    return {
      user: null,
      customState: null,
      authURL:
        'https://auth.waelio.com/login?client_id=2ok572ccqhse7j2ddn6vm1lr79&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/'
    }
  }
}
</script>
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
