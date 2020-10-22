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
    return {
      authConfig: {
        signUpConfig: {
          header: 'My Customized Sign Up',
          hideAllDefaults: true,
          defaultCountryCode: '1',
          signUpFields: [
            {
              label: 'Email',
              key: 'email',
              required: true,
              displayOrder: 1,
              type: 'string',
              signUpWith: true
            },
            {
              label: 'Password',
              key: 'password',
              required: true,
              displayOrder: 2,
              type: 'password'
            },
            {
              label: 'PhoneNumber',
              key: 'phone_number',
              required: true,
              displayOrder: 3,
              type: 'string'
            },
            {
              label: 'Custom Attribute',
              key: 'custom_attr',
              required: false,
              displayOrder: 4,
              type: 'string',
              custom: true
            }
          ]
        }
      }
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
