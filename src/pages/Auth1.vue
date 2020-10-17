<template>
  <div class="auth">
    <q-select color="white-1" label-color="primary" square outlined v-model="formState" class="q-my-md" :options="formsStates" label="Navigate Sections" />
    <amplify-authenticator></amplify-authenticator>
    <keep-alive>
      <q-slide-transition>
      <component @setFormState="setFormState" :is="formState" ></component>
      </q-slide-transition>
    </keep-alive>
    <div v-if="(formState === 'SignUp') || (formState === 'SignIn')">
      <q-btn @click="toggle" type="button" class="authButton">
        {{ formState === 'SignUp' ?
        'Already signed up? Sign In' : 'Need an account? Sign Up'
        }}
      </q-btn>
    </div>
  </div>
</template>
<script>
import AuthMixin from 'src/mixins/AuthMixin'
import SignUp from 'pages/Auth/SignUp'
import SignIn from 'pages/Auth/SignIn'
import ForgotPassword from 'pages/Auth/ForgotPassword'
import ChangePassword from 'pages/Auth/ChangePassword'
import VerifyEmail from 'pages/Auth/VerifyEmail'
export default {
  name: 'auth',
  mixins: [AuthMixin],
  components: {
    SignUp,
    SignIn,
    ForgotPassword,
    ChangePassword,
    VerifyEmail
  },
  data () {
    return {
      visible: ''
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
