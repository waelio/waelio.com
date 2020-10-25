<template>
  <div class="auth">
    <amplify-authenticator username-alias="email"></amplify-authenticator>
  </div>
</template>
<script>
export default {
  name: 'auth',
  props: [],
  data () {
    return {}
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
