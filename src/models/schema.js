export const schema = {
  models: {
    ShoppingList: {
      name: 'ShoppingList',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: []
        },
        name: {
          name: 'name',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: []
        },
        owner: {
          name: 'owner',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: []
        },
        shoppingItems: {
          name: 'shoppingItems',
          isArray: true,
          type: {
            model: 'ShoppingItem'
          },
          isRequired: false,
          attributes: [],
          isArrayNullable: true,
          association: {
            connectionType: 'HAS_MANY',
            associatedWith: 'shoppingList'
          }
        }
      },
      syncable: true,
      pluralName: 'ShoppingLists',
      attributes: [
        {
          type: 'model',
          properties: {}
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                provider: 'userPools',
                ownerField: 'owner',
                allow: 'owner',
                operations: [
                  'create',
                  'update',
                  'delete',
                  'read'
                ],
                identityClaim: 'cognito:username'
              }
            ]
          }
        }
      ]
    },
    ShoppingItem: {
      name: 'ShoppingItem',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: []
        },
        owner: {
          name: 'owner',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: []
        },
        title: {
          name: 'title',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: []
        },
        completed: {
          name: 'completed',
          isArray: false,
          type: 'Boolean',
          isRequired: false,
          attributes: []
        },
        shoppingList: {
          name: 'shoppingList',
          isArray: false,
          type: {
            model: 'ShoppingList'
          },
          isRequired: false,
          attributes: [],
          association: {
            connectionType: 'BELONGS_TO',
            targetName: 'shoppingListID'
          }
        }
      },
      syncable: true,
      pluralName: 'ShoppingItems',
      attributes: [
        {
          type: 'model',
          properties: {}
        },
        {
          type: 'key',
          properties: {
            name: 'byShoppingList',
            fields: [
              'shoppingListID'
            ]
          }
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                provider: 'userPools',
                ownerField: 'owner',
                allow: 'owner',
                operations: [
                  'create',
                  'update',
                  'delete',
                  'read'
                ],
                identityClaim: 'cognito:username'
              }
            ]
          }
        }
      ]
    },
    List: {
      name: 'List',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: []
        },
        title: {
          name: 'title',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: []
        },
        tasks: {
          name: 'tasks',
          isArray: true,
          type: {
            model: 'Task'
          },
          isRequired: false,
          attributes: [],
          isArrayNullable: true,
          association: {
            connectionType: 'HAS_MANY',
            associatedWith: 'list'
          }
        }
      },
      syncable: true,
      pluralName: 'Lists',
      attributes: [
        {
          type: 'model',
          properties: {}
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                provider: 'userPools',
                ownerField: 'owner',
                allow: 'owner',
                operations: [
                  'create',
                  'update',
                  'delete',
                  'read'
                ],
                identityClaim: 'cognito:username'
              },
              {
                groupClaim: 'cognito:groups',
                provider: 'userPools',
                allow: 'groups',
                groups: [
                  'Users'
                ],
                queries: [
                  'get',
                  'list'
                ],
                mutations: [
                  'update'
                ],
                operations: [
                  'update'
                ]
              }
            ]
          }
        }
      ]
    },
    Task: {
      name: 'Task',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: []
        },
        title: {
          name: 'title',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: []
        },
        description: {
          name: 'description',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: []
        },
        completed: {
          name: 'completed',
          isArray: false,
          type: 'Boolean',
          isRequired: true,
          attributes: []
        },
        list: {
          name: 'list',
          isArray: false,
          type: {
            model: 'List'
          },
          isRequired: false,
          attributes: [],
          association: {
            connectionType: 'BELONGS_TO',
            targetName: 'taskListId'
          }
        }
      },
      syncable: true,
      pluralName: 'Tasks',
      attributes: [
        {
          type: 'model',
          properties: {}
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                provider: 'userPools',
                ownerField: 'owner',
                allow: 'owner',
                operations: [
                  'create',
                  'update',
                  'delete',
                  'read'
                ],
                identityClaim: 'cognito:username'
              },
              {
                groupClaim: 'cognito:groups',
                provider: 'userPools',
                allow: 'groups',
                groups: [
                  'Users'
                ],
                queries: [
                  'get',
                  'list'
                ],
                mutations: [
                  'update',
                  'create'
                ],
                operations: [
                  'update',
                  'create'
                ]
              }
            ]
          }
        }
      ]
    },
    Chatty: {
      name: 'Chatty',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: []
        },
        user: {
          name: 'user',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: []
        },
        message: {
          name: 'message',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: []
        },
        createdAt: {
          name: 'createdAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: []
        }
      },
      syncable: true,
      pluralName: 'Chatties',
      attributes: [
        {
          type: 'model',
          properties: {}
        }
      ]
    }
  },
  enums: {},
  nonModels: {},
  version: '98b7fa475220bd796b2a61bd0c06e8f3'
}
