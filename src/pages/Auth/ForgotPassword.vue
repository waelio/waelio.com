<template>
  <div class="auth">
    <h3>Forgot password?</h3>
    <form @submit.prevent="forgotPassword">
      <q-input square filled color="teal" label="Username" v-model="form.username"/>
      <div class="row">
        <q-btn type="submit" @click="forgotPassword" label="Reset Password" class="authButton">
          <template v-slot:loading>
            <q-spinner-facebook/>
          </template>
        </q-btn>
        <q-btn type="button" size="sm" class="q-mb-sm" label="Back to login?" @click="$emit('setFormState', 'SignIn')"></q-btn>
      </div>
    </form>
  </div>
</template>
<script>
import AuthMixin from 'src/mixins/AuthMixin'
export default {
  name: 'ForgotPassword',
  mixins: [AuthMixin]
}
</script>
