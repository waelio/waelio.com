<script>
export default {
  name: 'Idbresponse',
  beforeRouteEnter (to, from) {
    const { Token } = this.$$route
    const verify = 'https://cognito-idp.us-east-1.amazonaws.com/<userpoolID>'
  },
  methods: {
    async handleResponse (data) {
      const { email, accessToken: token, expiresIn } = data
      // eslint-disable-next-line camelcase
      const expires_at = expiresIn * 1000 + new Date().getTime()
      const user = { email }

      this.setState({ isLoading: true })

      try {
        const response = await Auth.federatedSignIn(
          'facebook',
          { token, expires_at },
          user
        )
        this.setState({ isLoading: false })
        this.props.onLogin(response)
      } catch (e) {
        this.setState({ isLoading: false })
        this.handleError(e)
      }
    }
  }
}
</script>
