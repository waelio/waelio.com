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
import Amplify from 'aws-amplify'
import awsconfig from 'src/aws-exports'
import oAuthMixin from 'src/mixins/oAuthMixin'

Amplify.configure(awsconfig)
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'auth',
  mixins: [oAuthMixin],
  mounted () {

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
        'https://auth.waelio.com/login?client_id=1ad0455rde18h4dorn5q96njvh&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://waelio.com/auth/process',
      tokenUrl:
        'https://auth.waelio.com/login?client_id=1ad0455rde18h4dorn5q96njvh&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http://localhost:8080/auth/process'
    }
  },
  methods: {
    ...mapActions({
      signOut: 'LocalUser/signOut'
    })
  },
  computed: {
    ...mapGetters('LocalUser', ['User', 'signedIn'])
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
