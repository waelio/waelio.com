type Task
  @model
  @auth(
    rules: [
      { allow: groups, groups: ["Users"], queries: [get, list], mutations: [create, update, delete] }
      { allow: groups, groups: ["USERS"], queries: [get, list], mutations: null }
    ]
  ) {
  id: ID!
  title: String!
  description: String
  status: String
  completed: Boolean
}
type PrivateNote @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  content: String!
}
