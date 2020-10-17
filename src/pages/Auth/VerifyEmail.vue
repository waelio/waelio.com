<template>
  <div class="auth">
    <h2>Verify your email</h2>
    <amplify-confirm-sign-in ></amplify-confirm-sign-in>
    <form @submit.prevent="confirmSignUp">
      <q-input square filled color="teal" name="username" label="Username" v-model="form.username"/>
      <q-input square filled color="teal" name="authCode" label="Auth Code" v-model="form.authCode"/>
      <div class="row">
        <q-btn type="submit" @click="confirmSignUp" label="Sign In" class="authButton">
          <template v-slot:loading>
            <q-spinner-facebook/>
          </template>
        </q-btn>
      </div>
    </form>
  </div>
</template>
<script>
import AuthMixin from 'src/mixins/AuthMixin'
export default {
  name: 'VerifyEmail',
  mixins: [AuthMixin]
}
</script>
