<template>
  <div class="auth">
    <h2>Verify your email</h2>
    <form @submit.prevent="confirmSignUp">
      <q-input square filled color="teal" label="Username" v-model="form.username"/>
      <q-input square filled color="teal" label="Auth Code" v-model="form.authCode"/>
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
