<template>
  <div class="auth">
    <h2>Sign In</h2>
    <form @submit.prevent="signIn">
      <q-input square filled class="q-mb-sm" color="teal" name="username" label="Username" v-model="form.username"/>
      <q-input square filled class="q-mb-sm" color="teal" name="password" label="Password" type="password" v-model="form.password"/>
      <q-btn type="button" size="sm" class="q-mb-sm" label="Forgot Password?" @click="$emit('setFormState', 'ForgotPassword')"></q-btn>
      <div class="row">
        <q-btn type="submit" :disabled="!SignInReady" label="Sign In" class="authButton">
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
  name: 'SignIn',
  mixins: [AuthMixin]
}
</script>
