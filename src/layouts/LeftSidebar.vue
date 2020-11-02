<template>
  <q-list>
    <q-item-label header>Wael Wahbeh</q-item-label>
    <div v-if="!isLoggedIn">
      <q-item clickable to='/auth/authenticate'>
        <q-item-section avatar>
          <q-icon name="group" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Login/SignUp</q-item-label>
          <q-item-label caption>Login or Signup</q-item-label>
        </q-item-section>
      </q-item>
    </div>
    <div v-else>
      <q-item clickable @click="$emit('signOut')">
        <q-item-section avatar>
          <q-icon name="follow_the_signs" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Logout</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable to="/auth/profile">
        <q-item-section avatar>
          <q-icon name="person_pin" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Profile</q-item-label>
          <q-item-label caption>view your profile</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable to="/apps/shoppinglists/lists">
        <q-item-section avatar>
          <q-icon name="add_task" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Shopping List App</q-item-label>
          <q-item-label caption>create your List</q-item-label>
        </q-item-section>
      </q-item>
    </div>
    <div v-for="item in sidebar_public" :key="item.label">
      <q-item clickable :to="{ name: item.to.name }">
        <q-item-section v-if="item.avatar" avatar>
          <q-icon :name="item.avatar" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.label }}</q-item-label>
          <q-item-label caption>{{ item.caption }}</q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </q-list>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'LeftSidebar',
  props: ['isLoggedIn', 'signOut'],
  computed: {
    ...mapGetters('LSidebar', ['sidebar_authenticated', 'sidebar_public'])
  }
}
</script>

<style></style>
