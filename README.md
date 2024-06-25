# RenewX

[![npm version](https://img.shields.io/npm/v/%40renewx/core)](https://www.npmjs.com/package/@renewx/core)
[![downloads](https://img.shields.io/npm/dw/%40renewx/core)](https://www.npmjs.com/package/@renewx/core)
[![bundle size](https://img.shields.io/bundlejs/size/%40renewx/core?exports=store%2Caction%2Cadapter%2Cwatch&label=bundlejs%20(gzip))](https://github.com/adv0cat/renewx)
![npm type definitions](https://img.shields.io/npm/types/%40renewx%2Fcore)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

RenewX is a lightweight, high-performance state management library for TypeScript applications. It offers robust features like transactions and validation support, ensuring data integrity in your projects.

## Features

- 🚀 **High Performance**: Optimized for speed, perfect for both simple and complex data structures.
- ❄️ **Immutable State**: All states are wrapped with a Freeze type, preventing unintended mutations.
- ✅ **Built-in Validation**: Maintain data integrity with custom validation logic.
- 💯 **Transaction Support**: Implement MVCC, Snapshot Isolation, and Optimistic Concurrency Control for safe concurrent modifications.
- 🪶 **Lightweight**: Efficient solution keeping your project slim.
- ♻️ **Zero Dependencies**: Self-contained library for reliable performance.
- 📚 **TypeScript Native**: Full type safety and excellent developer experience.

## Installation

Install RenewX using npm:

```bash
npm install @renewx/core
```

Or using yarn:

```bash
yarn add @renewx/core
```

## Quick Start

Let's create a simple todo list application to demonstrate the basic usage of RenewX, including the `setup` and `creator` functions.

```typescript
import {
  store,
  action,
  adapter,
  watch,
  setup,
  creator,
  HasReadOnlyStoreWith,
} from "@renewx/core";

// Define the Todo interface
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Define the Todos interface
interface TodoList extends HasReadOnlyStoreWith<Todo[]> {
  add: (text: string) => void;
  toggle: (id: number) => void;
  getIncomplete: () => Todo[];
}

// Use creator to encapsulate todo list logic
const createTodoList = creator((cleaner): TodoList => {
  const todoList = store<Todo[]>([], "TODO_LIST");

  const add = action(
    todoList,
    (state, text: string) =>
      state.concat({ id: Date.now(), text, completed: false }),
    "add",
  );

  const toggle = action(
    todoList,
    (state, id: number) =>
      state.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    "toggle",
  );

  const incompleteTodos = adapter(
    todoList,
    (state) => state.filter((todo) => !todo.completed),
    "INCOMPLETE_TODOS",
  );
  cleaner.add(incompleteTodos);

  return {
    store: todoList.readOnly,
    add,
    toggle,
    getIncomplete: () => incompleteTodos.get(),
  };
});

// Use setup to create a reusable watch setup
const setupTodoWatch = setup((todoList: TodoList) =>
  watch(todoList.store, (state) => {
    console.log(`Total todos: ${state.length}`);
    console.log(`Incomplete todos: ${todoList.getIncomplete().length}`);
  }),
);

// Usage
const todoList = createTodoList();
const todoWatcher = setupTodoWatch(todoList);

todoList.add("Learn RenewX");
todoList.add("Build an awesome app");
todoList.toggle(todoList.store.get()[0].id);

console.log(todoList.getIncomplete());

// At some point, when cleaning up
todoWatcher.off();
todoList.off();
```

This example demonstrates the core concepts of RenewX: stores, actions, adapters, watchers, as well as the `setup` and `creator` functions. As we progress through the documentation, we'll explore these concepts in more depth.

## Core Concepts

### Store

A store is the foundation of state management in RenewX. It holds your application's data and ensures its immutability.

```typescript
import { store } from "@renewx/core";

const counter = store(0, "COUNTER");
console.log(counter.get()); // 0

counter.set(5);
console.log(counter.get()); // 5
```

### Action

Actions are functions that modify the state in a store. They provide a way to encapsulate state changes and make them reusable.

```typescript
import { action } from "@renewx/core";

const increment = action(
  counter,
  (state, amount: number) => state + amount,
  "increment",
);

increment(3);
console.log(counter.get()); // 8
```

### Adapter

Adapters allow you to derive computed values from one or more stores. They automatically update when their dependent stores change.

```typescript
import { adapter } from "@renewx/core";

const isEven = adapter(counter, (count) => count % 2 === 0, "IS_EVEN");
console.log(isEven.get()); // false

increment(2);
console.log(isEven.get()); // true
```

### Watch

The `watch` function allows you to observe changes in stores or adapters and react to them.

```typescript
import { watch } from "@renewx/core";

watch(counter, (count) => {
  console.log("Counter value:", count);
});

increment(5); // Console: Counter value: 13
```

## Advanced Concepts

### Setup Function

The `setup` function allows you to create reusable watch setups. This is particularly useful when you want to create a named initialization for watchers that can be easily reused and cleaned up.

```typescript
import { Store, store, watch, setup } from "@renewx/core";

interface UserProfile {
  name: string;
  age: number;
}
interface UserActivity {
  lastLogin: Date;
  loginCount: number;
}

const userProfile = store<UserProfile>(
  { name: "Alice", age: 30 },
  "USER_PROFILE",
);
const userActivity = store<UserActivity>(
  { lastLogin: new Date(), loginCount: 0 },
  "USER_ACTIVITY",
);

const setupUserMonitor = setup(
  (profile: Store<UserProfile>, activity: Store<UserActivity>) => [
    watch(profile, ({ name, age }) => {
      console.log(`Profile updated: ${name}, ${age} years old`);
    }),
    watch(activity, ({ lastLogin, loginCount }) => {
      console.log(
        `Last login: ${lastLogin.toLocaleString()}, Total logins: ${loginCount}`,
      );
    }),
  ],
);

// Usage
const userMonitor = setupUserMonitor(userProfile, userActivity);

// Update the profile and activity
userProfile.set({ name: "Alice", age: 31 });
userActivity.set({ lastLogin: new Date(), loginCount: 5 });

// Later, when cleaning up
userMonitor.off();
```

In this example, `setupUserMonitor` creates two watchers: one for the user profile and another for user activity. The `setup` function allows us to bundle these watchers together, making it easy to initialize and clean up the monitoring in one go.

### Creator Function

The `creator` function is used to encapsulate the initialization logic for a store and its related functionality. This keeps all the logic related to a particular entity in one place, making your code more organized and easier to maintain.

```typescript
import {
  store,
  action,
  watch,
  creator,
  adapter,
  HasReadOnlyStoreWith,
} from "@renewx/core";

interface Stock {
  symbol: string;
  price: number;
  quantity: number;
}

interface Portfolio extends HasReadOnlyStoreWith<Stock[]> {
  addStock: (symbol: string, price: number, quantity: number) => void;
  updatePrice: (symbol: string, newPrice: number) => void;
}

const createPortfolio = creator((cleaner): Portfolio => {
  const stocks = store<Stock[]>([], "STOCKS");

  const addStock = action(
    stocks,
    (state, symbol: string, price: number, quantity: number) =>
      state.concat({ symbol, price, quantity }),
    "add_stock",
  );

  const updatePrice = action(
    stocks,
    (state, symbol: string, newPrice: number) =>
      state.map((stock) =>
        stock.symbol === symbol ? { ...stock, price: newPrice } : stock,
      ),
    "update_price",
  );

  return {
    store: stocks.readOnly,
    addStock,
    updatePrice,
  };
});

const createPortfolioMonitor = creator((cleaner, portfolio: Portfolio) => {
  const totalValue = adapter(
    portfolio.store,
    (stocks) =>
      stocks.reduce((total, stock) => total + stock.price * stock.quantity, 0),
    "TOTAL_VALUE",
  );

  cleaner.add(
    watch(totalValue, (value) => {
      console.log(`Current portfolio value: $${value.toFixed(2)}`);
    }),
  );

  return {
    store: totalValue.readOnly,
  };
});

// Usage
const portfolio = createPortfolio();
const portfolioMonitor = createPortfolioMonitor(portfolio);

portfolio.addStock("AAPL", 150.25, 10);
portfolio.addStock("GOOGL", 2750.5, 5);
portfolio.updatePrice("AAPL", 155.75);

// Later, when cleaning up
portfolioMonitor.off();
portfolio.off();
```

In this example, `createPortfolio` encapsulates all the logic related to managing a stock portfolio, including the store and actions. The `createPortfolioMonitor` function creates a separate entity responsible for monitoring the portfolio's total value. The `creator` function ensures that all cleanup logic is handled automatically when `off` is called.

These advanced concepts, `setup` and `creator`, provide powerful tools for structuring your application's state management in a clean and maintainable way. They allow you to create reusable patterns and encapsulate related functionality, leading to more organized and easier to understand code.

## Advanced Usage

### Nested Watchers

RenewX allows you to create nested watchers, which can be useful for complex reactive scenarios.

```typescript
import { store, action, watch } from "@renewx/core";

const user = store({ name: "John", isOnline: false }, "USER");
const messages = store([], "MESSAGES");

const setOnlineStatus = action(
  user,
  ({ name }, isOnline: boolean) => ({ name, isOnline }),
  "set_online_status",
);

watch(user, (userData) => {
  console.log(
    `User ${userData.name} status changed to ${userData.isOnline ? "online" : "offline"}`,
  );

  // Nested watcher
  if (userData.isOnline) {
    return watch(messages, (messages) => {
      console.log(`New message count: ${messages.length}`);
    });
  }
});

// Usage
setOnlineStatus(true);
messages.set(["Hello!"]);
setOnlineStatus(false);
```

### Working with Event Emitters

RenewX can be seamlessly integrated with traditional event emitters. Here's an example of how to use `watch` with DOM events:

```typescript
import { store, watch } from "@renewx/core";

const windowSize = store(
  { width: window.innerWidth, height: window.innerHeight },
  "WINDOW_SIZE",
);

watch(windowSize, () => {
  console.log("Window resized");

  const handleResize = () => {
    windowSize.set({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  window.addEventListener("resize", handleResize);

  // Return an unsubscribe function
  return () => {
    window.removeEventListener("resize", handleResize);
  };
});

// The watcher will log "Window resized" and update the windowSize store whenever the window is resized
```

### Validation

RenewX provides a way to validate state changes before they're applied to the store.

```typescript
import { store } from "@renewx/core";

const age = store(0, "AGE");

age.validator((oldValue, newValue) => {
  return newValue >= 0 && newValue <= 120;
});

age.set(25); // Valid, state is updated
console.log(age.get()); // 25

age.set(-5); // Invalid, state remains unchanged
console.log(age.get()); // 25
```

### Transactions

For complex state updates, especially those involving asynchronous operations, RenewX provides transaction support.

```typescript
import { store, tx } from "@renewx/core";

const balance = store(1000, "BALANCE");
const transactionLog = store<string[]>([], "TRANSACTION_LOG");

const transferMoney = tx(
  [balance, transactionLog],
  async ([balanceTx, logTx], amount: number) => {
    const currentBalance = balanceTx.get();

    if (currentBalance < amount) {
      throw new Error("Insufficient funds");
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    balanceTx.set(currentBalance - amount);
    logTx.set(logTx.get().concat([`Transferred $${amount}`]));

    return { newBalance: balanceTx.get() };
  },
);

// Usage
transferMoney(500)
  .then((result) =>
    console.log("Transfer successful. New balance:", result.newBalance),
  )
  .catch((error) => console.error("Transfer failed:", error.message));
```

This transaction ensures that both the balance update and the transaction log update occur atomically. If any part of the transaction fails, all changes are rolled back.

### Grouping Actions

For stores with multiple related actions, you can use the `actions` function to group them together.

```typescript
import { store, actions } from "@renewx/core";

const counter = store(0, "COUNTER");

const counterActions = actions(counter, {
  increment: (state, amount: number) => state + amount,
  decrement: (state, amount: number) => state - amount,
  reset: () => 0,
});

// Usage
counterActions.increment(5);
console.log(counter.get()); // 5

counterActions.decrement(2);
console.log(counter.get()); // 3

counterActions.reset();
console.log(counter.get()); // 0
```

### Cleaner Utility

RenewX provides a `cleaner` utility for managing disposable resources. This is particularly useful for grouping multiple unsubscribe functions or `off` methods, making resource cleanup more manageable.

```typescript
import { cleaner } from "@renewx/core";

const resourceCleaner = cleaner();

// Adding disposables
const unsubscribe1 = resourceCleaner.add(() => console.log("Resource 1 cleaned"));
const unsubscribe2 = resourceCleaner.add(() => console.log("Resource 2 cleaned"));

// Removing a specific disposable
resourceCleaner.remove(unsubscribe1);

// Cleaning up all remaining resources
resourceCleaner.off();
```

The `cleaner` function accepts any number of disposable items. A disposable can be:
- An object with an `off` method
- A function that performs cleanup when called
- `undefined` or `null` (which are ignored)

You can add disposables at any time using the `add` method, remove specific disposables with the `remove` method, and clean up all resources at once with the `off` method.

Here's an example of using `cleaner` with watchers:

```typescript
import { store, watch, cleaner } from "@renewx/core";

const userStore = store({ name: "John", age: 30 }, "USER");
const taskStore = store([], "TASKS");

const appCleaner = cleaner();

appCleaner.add(
  watch(userStore, (user) => console.log("User updated:", user)),
  watch(taskStore, (tasks) => console.log("Tasks updated:", tasks))
);

// Later, when you want to clean up all watchers:
appCleaner.off();
```

Using the `cleaner` utility helps prevent memory leaks by ensuring all resources are properly disposed of when they're no longer needed.

### Read-Only Store Access

In some cases, you might want to provide read-only access to a store. RenewX offers a `readOnly` property for this purpose.

```typescript
import { store, watch } from "@renewx/core";

const data = store({ value: 0 }, "DATA");

// Read-only access
const readOnlyData = data.readOnly;

watch(readOnlyData, (data) => {
  console.log("Data changed:", data.value);
});

// This works
data.set({ value: 5 });

// This would cause a TypeScript error
// readOnlyData.set({ value: 10 });
```

### Performance Optimization with Batch

When creating multiple adapters or watchers, you can use the `batch` function to optimize performance.

```typescript
import { store, adapter, batch } from "@renewx/core";

const userStore = store({ name: "John", age: 30 }, "USER");

batch.stores.start();

const name = adapter(userStore, (state) => state.name, "NAME");
const age = adapter(userStore, (state) => state.age, "AGE");
const fullInfo = adapter(
  userStore,
  (state) => `${state.name} (${state.age})`,
  "FULL_INFO",
);

batch.stores.end();

console.log(name.get()); // "John"
console.log(age.get()); // 30
console.log(fullInfo.get()); // "John (30)"
```

Using `batch` can significantly improve performance when creating multiple adapters or watchers simultaneously.

## Best Practices

1. **Use Immutable Updates**: Always create new objects or arrays when updating state, rather than mutating existing ones.

2. **Keep Stores Focused**: Each store should represent a cohesive piece of state. Don't try to put your entire application state in a single store.

3. **Leverage Adapters**: Use adapters to compute derived state instead of storing computed values directly.

4. **Unsubscribe from Watchers**: Always unsubscribe from watchers when they're no longer needed to prevent memory leaks.

5. **Use Meaningful Names**: Give your stores, actions, and adapters clear, descriptive names that reflect their purpose.

6. **Organize Related Logic**: Use the `creator` function to group related stores, actions, and adapters together.

7. **Reuse Watch Logic**: Utilize the `setup` function to create reusable watch setups for common patterns in your application.

8. **Be Careful with `.unsafe()`**: The `.unsafe()` method bypasses the Freeze type. Use it sparingly and only when absolutely necessary.

9. **Validate Early**: Use validators to ensure your state always remains in a valid form.

10. **Use Transactions for Complex Updates**: When you need to update multiple stores atomically or perform asynchronous operations, use transactions.

## Conclusion

RenewX provides a powerful yet flexible approach to state management in TypeScript applications. By leveraging its core concepts of stores, actions, adapters, and watchers, you can build robust and reactive applications with ease. The advanced features like `setup` and `creator` functions, along with transaction support and performance optimizations, allow you to tackle even the most complex state management scenarios.

Remember, the key to effective state management is to start simple and add complexity only as needed. As you become more familiar with RenewX, you'll discover how its features can help you create clean, maintainable, and efficient state management solutions for your applications.

Happy coding with RenewX!
