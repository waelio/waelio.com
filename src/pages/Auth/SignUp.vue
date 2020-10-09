<template>
  <div class="auth">
    <h2>{{ formState === 'SignUp' ? 'Sign Up' : 'Confirm Sign Up' }}</h2>
    <form @submit.prevent="signUp">
      <div v-if="formState === 'SignUp'">
        <q-input square filled color="teal"  class="q-mb-sm" label="Username" v-model="form.username"/>
        <q-input
          square
          filled
          color="teal"
          label="Password"
          type="password"
          v-model="form.password"
           class="q-mb-sm"
        />
        <q-input square filled  class="q-mb-sm" color="teal" label="E-mail" v-model="form.email"/>
        <div class="row">
          <q-btn type="submit" :disabled="!SignUpReady"  @click="signUp" label="Sign Up" class="q-mb-sm authButton">
            <template v-slot:loading>
              <q-spinner-facebook/>
            </template>
          </q-btn>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import AuthMixin from 'src/mixins/AuthMixin'
export default {
  name: 'Signup',
  mixins: [AuthMixin]
}
</script>
