import { Notify } from 'quasar'
export default {
  data () {
    return {
      formState: 'SignUp',
      formsStates: ['SignIn', 'SignUp', 'ConfirmSignUp', 'ForgotPassword', 'ConfirmCode'],
      form: {
        authCode: null,
        username: null,
        email: '',
        password: '',
        currentPassword: null,
        newPassword: null

      }
    }
  },
  methods: {
    toggle () {
      this.formState === 'SignUp' ? this.formState = 'SignIn' : this.formState = 'SignUp'
    },
    setFormState (newFormState) {
      this.formState = newFormState
      return this.formState
    },
    async forgotPassword () {
      await this.$Auth.forgotPassword(this.username)
        .then(data => {
          console.log(data)
          return Promise.resolve(data)
        })
        .catch(err => {
          console.log(err)
          Notify.create({
            caption: err.name,
            message: err.message,
            type: 'negative',
            timeout: 10000
          })
          return Promise.reject(err)
        })
    },
    changePassword () {
      this.formState = 'changePassword'
    },
    async confirmSignUp () {
      const { username, authCode } = this
      await this.$Auth.confirmSignUp(username, authCode).then(
        success => {
          this.toggle()
          console.log('ANSWER', !!success)
        },
        problem => {
          console.error('Error1', problem)
          if (problem._type === 'UserNotConfirmedException') {
            this.$AmplifyEventBus.$emit('authState', 'signedIn')
          }
          Notify.create({
            caption: problem.name,
            message: problem.message,
            type: 'negative',
            timeout: 10000
          })
        }
      ).catch(exp => {
        console.error('Exp', exp)
        Notify.create({
          caption: exp.name,
          message: exp.message,
          type: 'negative',
          timeout: 10000
        })
      })
    },
    async signIn () {
      const { username, password } = this.form
      await this.$Auth.signIn(username, password)
        .then(success => {
          this.$AmplifyEventBus.$emit('authState', 'signedIn')
          parent.signedIn = true
          Notify.create({
            caption: 'Success',
            message: 'Login Success',
            type: 'positive'
          })
          this.$router.push({ name: 'todo' })
          console.log('ANSWER', !!success)
        }).catch(exp => {
          console.error('Exp1', exp)
          if (exp._type === 'UserNotConfirmedException') {
            this.authState = 'confirmSignUp'
          } else if (exp._type === 'UsernameExistsException') {
            this.authState = 'signUp'
          }
          Notify.create({
            caption: exp.name,
            message: exp.message,
            type: 'negative',
            timeout: 10000
          })
        })
    },
    async signUp () {
      const { username, password, email } = this.form
      await this.$Auth.signUp({
        username, password, attributes: { email }
      }).then(
        success => {
          console.log('ANSWER', !!success)
          this.formState = 'confirmSignUp'
        },
        problem => {
          console.error('Error1', problem)
          if (problem._type === 'UsernameExistsException') {
            this.formState = 'signIn'
          }
          Notify.create({
            caption: problem.name,
            message: problem.message,
            type: 'negative',
            timeout: 10000
          })
        }
      ).catch(exp => {
        console.error('Exp', exp)
        Notify.create({
          caption: exp.name,
          message: exp.message,
          type: 'negative',
          timeout: 10000
        })
      })
    },
    async confirmCode () {
      const { username, authCode } = this.form
      await this.$Auth.confirmSignUp(username, authCode).then(
        success => {
          this.toggle()
          console.log('ANSWER', !!success)
        },
        problem => {
          console.error('Error1', problem)
          if (problem._type === 'UserNotConfirmedException') {
            this.$AmplifyEventBus.$emit('authState', 'signedIn')
          }
          Notify.create({
            caption: problem.name,
            message: problem.message,
            type: 'negative',
            timeout: 10000
          })
        }
      ).catch(exp => {
        console.error('Exp', exp)
        Notify.create({
          caption: exp.name,
          message: exp.message,
          type: 'negative',
          timeout: 10000
        })
      })
    }
  },
  computed: {
    SignInReady () {
      return !!(this.form.username && this.form.password)
    },
    SignUpReady () {
      return !!(this.form.username && this.form.password && this.form.email)
    },
    VerifyEmailReady () {
      return !!this.authCode
    },
    ResetPasswordReady () {
      return !!(this.form.username && this.form.currentPassword && this.form.newPassword)
    }
  }
}
