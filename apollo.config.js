module.exports = {
  client: {
    service: {
      name: 'waeliocom',
      localSchemaFile: 'amplify/backend/api/waeliocom/schema.graphql'
    },
    // Files processed by the extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js'
    ]
  }
}
