import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class ShoppingList {
  readonly id: string;
  readonly name: string;
  readonly owner?: string;
  readonly shoppingItems?: (ShoppingItem | null)[];
  constructor(init: ModelInit<ShoppingList>);
  static copyOf(source: ShoppingList, mutator: (draft: MutableModel<ShoppingList>) => MutableModel<ShoppingList> | void): ShoppingList;
}

export declare class ShoppingItem {
  readonly id: string;
  readonly owner?: string;
  readonly title: string;
  readonly completed?: boolean;
  readonly shoppingList?: ShoppingList;
  constructor(init: ModelInit<ShoppingItem>);
  static copyOf(source: ShoppingItem, mutator: (draft: MutableModel<ShoppingItem>) => MutableModel<ShoppingItem> | void): ShoppingItem;
}

export declare class List {
  readonly id: string;
  readonly title: string;
  readonly tasks?: (Task | null)[];
  constructor(init: ModelInit<List>);
  static copyOf(source: List, mutator: (draft: MutableModel<List>) => MutableModel<List> | void): List;
}

export declare class Task {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly completed: boolean;
  readonly list?: List;
  constructor(init: ModelInit<Task>);
  static copyOf(source: Task, mutator: (draft: MutableModel<Task>) => MutableModel<Task> | void): Task;
}

export declare class Chatty {
  readonly id: string;
  readonly user: string;
  readonly message: string;
  readonly createdAt?: string;
  constructor(init: ModelInit<Chatty>);
  static copyOf(source: Chatty, mutator: (draft: MutableModel<Chatty>) => MutableModel<Chatty> | void): Chatty;
}