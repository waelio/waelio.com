// import something here
import Vue from 'vue'
import VueApollo from 'vue-apollo'
import AWSAppSyncClient from 'aws-appsync'
import awsmobile from 'src/aws-exports'

const config = {
  url: awsmobile.aws_appsync_graphqlEndpoint,
  region: awsmobile.aws_appsync_region,
  auth: {
    type: awsmobile.aws_appsync_authenticationType,
    jwtToken: async () => (await Vue.prototype.$Auth.currentSession()).getIdToken().getJwtToken()
  }
}
const options = {
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    },
    connectToDevTools: true, // Remove this for production use
    disableOffline: false,
    skipSSLValidation: true
  }
}

const client = new AWSAppSyncClient(config, options)
const appsyncProvider = new VueApollo({
  defaultClient: client
})
export default async ({ app, router, Vue }) => {
  // something to do
  Vue.use(VueApollo)
  app.apolloProvider = appsyncProvider
}
