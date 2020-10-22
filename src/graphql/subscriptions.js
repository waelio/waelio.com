/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateShoppingList = /* GraphQL */ `
  subscription OnCreateShoppingList {
    onCreateShoppingList {
      id
      name
      shoppingItems {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateShoppingList = /* GraphQL */ `
  subscription OnUpdateShoppingList {
    onUpdateShoppingList {
      id
      name
      shoppingItems {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteShoppingList = /* GraphQL */ `
  subscription OnDeleteShoppingList {
    onDeleteShoppingList {
      id
      name
      shoppingItems {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateShoppingItem = /* GraphQL */ `
  subscription OnCreateShoppingItem {
    onCreateShoppingItem {
      id
      title
      shoppingListID
      shoppingList {
        id
        name
        createdAt
        updatedAt
      }
      comments {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateShoppingItem = /* GraphQL */ `
  subscription OnUpdateShoppingItem {
    onUpdateShoppingItem {
      id
      title
      shoppingListID
      shoppingList {
        id
        name
        createdAt
        updatedAt
      }
      comments {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteShoppingItem = /* GraphQL */ `
  subscription OnDeleteShoppingItem {
    onDeleteShoppingItem {
      id
      title
      shoppingListID
      shoppingList {
        id
        name
        createdAt
        updatedAt
      }
      comments {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment {
    onCreateComment {
      id
      ShoppingItemID
      shoppingItem {
        id
        title
        shoppingListID
        createdAt
        updatedAt
      }
      content
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment {
    onUpdateComment {
      id
      ShoppingItemID
      shoppingItem {
        id
        title
        shoppingListID
        createdAt
        updatedAt
      }
      content
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment {
    onDeleteComment {
      id
      ShoppingItemID
      shoppingItem {
        id
        title
        shoppingListID
        createdAt
        updatedAt
      }
      content
      createdAt
      updatedAt
    }
  }
`;
