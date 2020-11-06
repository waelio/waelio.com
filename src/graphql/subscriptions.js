/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateShoppingList = /* GraphQL */ `
  subscription OnCreateShoppingList($owner: String!) {
    onCreateShoppingList(owner: $owner) {
      id
      name
      owner
      shoppingItems {
        items {
          id
          owner
          title
          shoppingListID
          completed
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateShoppingList = /* GraphQL */ `
  subscription OnUpdateShoppingList($owner: String!) {
    onUpdateShoppingList(owner: $owner) {
      id
      name
      owner
      shoppingItems {
        items {
          id
          owner
          title
          shoppingListID
          completed
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteShoppingList = /* GraphQL */ `
  subscription OnDeleteShoppingList($owner: String!) {
    onDeleteShoppingList(owner: $owner) {
      id
      name
      owner
      shoppingItems {
        items {
          id
          owner
          title
          shoppingListID
          completed
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onCreateShoppingItem = /* GraphQL */ `
  subscription OnCreateShoppingItem($owner: String!) {
    onCreateShoppingItem(owner: $owner) {
      id
      owner
      title
      shoppingListID
      completed
      shoppingList {
        id
        name
        owner
        shoppingItems {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateShoppingItem = /* GraphQL */ `
  subscription OnUpdateShoppingItem($owner: String!) {
    onUpdateShoppingItem(owner: $owner) {
      id
      owner
      title
      shoppingListID
      completed
      shoppingList {
        id
        name
        owner
        shoppingItems {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteShoppingItem = /* GraphQL */ `
  subscription OnDeleteShoppingItem($owner: String!) {
    onDeleteShoppingItem(owner: $owner) {
      id
      owner
      title
      shoppingListID
      completed
      shoppingList {
        id
        name
        owner
        shoppingItems {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onCreatePrivateNote = /* GraphQL */ `
  subscription OnCreatePrivateNote($owner: String!) {
    onCreatePrivateNote(owner: $owner) {
      id
      content
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdatePrivateNote = /* GraphQL */ `
  subscription OnUpdatePrivateNote($owner: String!) {
    onUpdatePrivateNote(owner: $owner) {
      id
      content
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeletePrivateNote = /* GraphQL */ `
  subscription OnDeletePrivateNote($owner: String!) {
    onDeletePrivateNote(owner: $owner) {
      id
      content
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onCreateList = /* GraphQL */ `
  subscription OnCreateList($owner: String!) {
    onCreateList(owner: $owner) {
      id
      title
      tasks {
        items {
          id
          title
          description
          completed
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateList = /* GraphQL */ `
  subscription OnUpdateList($owner: String!) {
    onUpdateList(owner: $owner) {
      id
      title
      tasks {
        items {
          id
          title
          description
          completed
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteList = /* GraphQL */ `
  subscription OnDeleteList($owner: String!) {
    onDeleteList(owner: $owner) {
      id
      title
      tasks {
        items {
          id
          title
          description
          completed
          _version
          _deleted
          _lastChangedAt
          createdAt
          updatedAt
        }
        nextToken
        startedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onCreateTask = /* GraphQL */ `
  subscription OnCreateTask($owner: String!) {
    onCreateTask(owner: $owner) {
      id
      title
      description
      completed
      list {
        id
        title
        tasks {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateTask = /* GraphQL */ `
  subscription OnUpdateTask($owner: String!) {
    onUpdateTask(owner: $owner) {
      id
      title
      description
      completed
      list {
        id
        title
        tasks {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteTask = /* GraphQL */ `
  subscription OnDeleteTask($owner: String!) {
    onDeleteTask(owner: $owner) {
      id
      title
      description
      completed
      list {
        id
        title
        tasks {
          nextToken
          startedAt
        }
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
      }
      _version
      _deleted
      _lastChangedAt
      createdAt
      updatedAt
    }
  }
`;
export const onCreateChatty = /* GraphQL */ `
  subscription OnCreateChatty {
    onCreateChatty {
      id
      user
      message
      createdAt
      _version
      _deleted
      _lastChangedAt
      updatedAt
    }
  }
`;
export const onUpdateChatty = /* GraphQL */ `
  subscription OnUpdateChatty {
    onUpdateChatty {
      id
      user
      message
      createdAt
      _version
      _deleted
      _lastChangedAt
      updatedAt
    }
  }
`;
export const onDeleteChatty = /* GraphQL */ `
  subscription OnDeleteChatty {
    onDeleteChatty {
      id
      user
      message
      createdAt
      _version
      _deleted
      _lastChangedAt
      updatedAt
    }
  }
`;
