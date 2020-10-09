<template>
  <div class="auth">
    <h2>Change Password</h2>
    <form @submit.prevent="changePassword">
      <q-input square filled color="teal" label="Username" v-model="form.currentPassword"/>
      <q-input square filled color="teal" label="Password" type="password" v-model="form.newPassword"/>
      <div class="row">
        <q-btn type="submit" @click="changePassword" label="Change Password" class="authButton">
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
  name: 'ChangePassword',
  mixins: [AuthMixin]
}
</script>
<style>
.authButton {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #2196f3;
  border: none;
  color: white;
  outline: none;
}
.auth {
  margin: 0 auto;
  width: 460px;
}
</style>
