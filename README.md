# RenewX

[![npm version](https://img.shields.io/npm/v/%40renewx/core)](https://www.npmjs.com/package/@renewx/core)
[![downloads](https://img.shields.io/npm/dw/%40renewx/core)](https://www.npmjs.com/package/@renewx/core)
[![bundle size](https://img.shields.io/bundlejs/size/%40renewx/core?exports=store%2Caction%2Cadapter%2Cwatch&label=bundlejs%20(gzip))](https://github.com/adv0cat/renewx)
![npm type definitions](https://img.shields.io/npm/types/%40renewx%2Fcore)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

`RenewX` is a TypeScript state management library offering transaction and validation support for reliable data integrity. Its lightweight nature and straightforward setup make it a solid choice for seamless state handling in your projects.

## Features

- 🚀 **High Performance**: RenewX is engineered for speed, ensuring highly optimized data handling and minimal performance overhead. Experience lightning-fast state management, whether you're working with simple or complex data structures.
- ❄️ **Freeze State**: All states are encapsulated with a Freeze type at the type level, ensuring immutability and preventing unintended mutations. This immutability facilitates efficient and swift data processing.
- ✅ **Validation Support**: Maintain data integrity by utilizing built-in validation support for your state changes, allowing for custom validation logic.
- 💯 **Transaction Handling**: Ensure reliable state updates with transaction support, implementing MVCC (Multiversion concurrency control), Snapshot Isolation, and Optimistic Concurrency Control (OCC) for safe concurrent modifications.
- 🪶 **Lightweight**: A minimalistic and efficient solution for state management, keeping your project slim.
- ♻️ **Zero Dependencies**: The library is self-contained with no external dependencies, making it a reliable and lightweight choice.
- 📚 **Typescript Native**: Fully written in TypeScript, providing excellent type safety and developer experience.

These features provide a solid foundation for building scalable and maintainable applications, ensuring your state management logic remains clean and understandable as your project grows.

## Installation

Install RenewX via npm:

```bash
npm install @renewx/core
```

Or via yarn:

```bash
yarn add @renewx/core
```

## Quick Start

In this quick start guide, we'll create a simple counter application to demonstrate the basic usage of `RenewX`. We will use a `store` to manage the state, an `action` to update the state, an `adapter` to compute derived state, and `watch` to respond to state changes.

```typescript
import { store, action, adapter, watch } from "@renewx/core";

// 1. Create a store to hold the state of our counter
const counter = store(0);

// 2. Set a new value to the counter directly
counter.set(5);

// 3. Create an action to increment the counter
const increment = action(counter, (state, amount: number) => state + amount);

// 4. Create an adapter to compute the message to display based on the counter value
const message = adapter(counter, (count) => `The counter is at: ${count}`);

// 5. Watch for changes in the message and log them
watch(message, (msg) => {
  console.log(msg);
});

// Now, let's use the action to increment the counter:
increment(1); // Console: The counter is at: 6
increment(2); // Console: The counter is at: 8
```

In this updated example:

- After creating a `store`, we use `set` to update the counter value directly.
- The rest of the steps remain the same: create an `action`, an `adapter`, and use `watch` to log the message to the console whenever the message changes.
- By running the `increment` action, we trigger a chain of updates that flows through the `action`, `adapter`, and `watch`, demonstrating the core features of `RenewX` in a simple scenario.

## Usage

Detailed examples for each functionality will be provided shortly. The core concepts include defining a store, creating actions to update the store, utilizing adapters for computed values, and setting up watchers to observe changes.

### Defining a Store

Demonstration of creating a simple `store` to manage state.

```typescript
import { store } from "@renewx/core";

const userData = store({ userId: 1, userName: "LeBron James", userScore: 0 });
```

### Updating Store State

Illustration of updating `store` state using the store's `set` function.

```typescript
// Updating the user data after a 5 second delay
setTimeout(() => {
  // Assume we have some new data to update
  userData.set({ userId: 2, userName: "Kevin Durant", userScore: 30 });
}, 5000);
```

### Creating and Using Action

The difference between `set` and `action`:

- `set` is used to update the entire state with a new object.
- `action` is used to create a transformation for the state, which can be invoked later with semantic naming and additional parameters, allowing partial updates to the state.

```typescript
import { action } from "@renewx/core";

const incrementScore = action(userData, (state, additionalScore) => {
  return { userScore: state.userScore + additionalScore };
});

// Call the action with a value of 10
incrementScore(10);
```

### Utilizing Adapters

Creating an `adapter` to compute derived state based on the store’s state.

```typescript
import { adapter } from "@renewx/core";

const userLevel = adapter(userData, (state) => {
  return { level: state.userScore >= 100 ? "Advanced" : "Beginner" };
});
```

### Watching Changes

Setting up a `watch` to respond to state changes and log them to the console.

```typescript
import { watch } from "@renewx/core";

watch([userData, userLevel], ([state, levelState]) => {
  console.log("User Score:", state.userScore);
  console.log("User Level:", levelState.level);
});
```

### Setting Up Validations

Implementing a `validator` to ensure only valid state updates are committed to the store.

```typescript
userData.validator((oldValue, newValue) => {
  // Ensure the userScore is non-negative
  return newValue.userScore >= 0;
});

// Now if a set operation tries to set a negative userScore, the state will not change
userData.set({ userScore: -10 }); // The userData's state will remain unchanged due to the validator
```

### Implementing Transactions

Executing a `transaction` that demonstrates `async` functionality.

```typescript
import { tx } from "@renewx/core";

const updateScore = tx([userData], async ([userTxState], bonusScore: number) => {
  const currentScore = userTxState.get().userScore;

  // The Promise here simulates an asynchronous operation, like fetching data from a server.
  // It demonstrates the ability to handle async operations within a transaction.
  const bonus = await new Promise((resolve) =>
    setTimeout(() => resolve(bonusScore), 2000),
  );

  const newScore = currentScore + bonus;
  userTxState.set({ userScore: newScore });
  return { newScore };
});

// Execute the transaction with additional arguments
updateScore(50)
  .then((result) => {
    console.log("Transaction committed with result:", result);
  })
  .catch((reason) => {
    console.error("Transaction rolled back due to:", reason);
  });
```

### Grouping `action` with `actions` function

The `actions` function helps group multiple actions for a store into a single semantic object, making it convenient to manage related actions together. This function takes a `store` and an object of `action` functions, returning an object that encapsulates all these `actions` for easy usage.

```typescript
import { store, actions } from "@renewx/core";

const teamScore = store({ homeTeamScore: 0, awayTeamScore: 0 });

const scoreActions = actions(teamScore, {
  incrementHome: (state, points: number) => ({
    homeTeamScore: state.homeTeamScore + points,
    awayTeamScore: state.awayTeamScore,
  }),
  incrementAway: (state, points: number) => ({
    homeTeamScore: state.homeTeamScore,
    awayTeamScore: state.awayTeamScore + points,
  }),
  reset: () => ({
    homeTeamScore: 0,
    awayTeamScore: 0,
  }),
});

// Initial: { homeTeamScore: 0, awayTeamScore: 0 }
scoreActions.incrementHome(3); // { homeTeamScore: 3, awayTeamScore: 0 }
scoreActions.incrementAway(2); // { homeTeamScore: 3, awayTeamScore: 2 }
scoreActions.reset(); // { homeTeamScore: 0, awayTeamScore: 0 }
```

## Advanced Example

### Subscribing and Unsubscribing to updates with `watch`

Demonstration of returning an unsubscribe function in a `watch` callback to manage event listeners.

```typescript
import { watch } from "@renewx/core";

const gameStatus = store({ isLive: false });

// Assume there's an event emitter that emits game updates
const gameUpdatesEmitter = new EventEmitter();

// Function to handle game updates
const handleGameUpdate = (update) => {
  console.log("Game Update:", update);
};

// If you return a function in the "watch" callback,
// it will be invoked as an unsubscribe function when the state changes.
watch(gameStatus, (state) => {
  if (state.isLive) {
    console.log("Game is live!");

    // Subscribing to game updates...
    gameUpdatesEmitter.on("update", handleGameUpdate);

    // Returning a function to unsubscribe when the game is no longer live
    return () => {
      // Unsubscribing from game updates...
      gameUpdatesEmitter.off("update", handleGameUpdate);
    };
  } else {
    console.log("Game is not live anymore!");
  }
});

// Simulating the game going live and then ending
gameStatus.set({ isLive: true }); // Console: 'Game is live!'
setTimeout(() => {
  gameStatus.set({ isLive: false }); // Console: 'Game is not live anymore!'
}, 1000);
```

### Utilizing Adapter with Multi-Stores

Illustrates how to create an `adapter` that derives data from multiple stores, showcasing the aggregation of data from different sources into a single computed value.

```typescript
import { store, adapter } from "@renewx/core";

const initialGameScore = { homeTeamScore: 0, awayTeamScore: 0 };
const gameScore = store(initialGameScore);

const combinedData = adapter(
  [userData, gameScore],
  ([userState, gameScoreState]) => {
    return {
      userName: userState.userName,
      homeTeamScore: gameScoreState.homeTeamScore,
      awayTeamScore: gameScoreState.awayTeamScore,
      totalScore:
        userState.userScore +
        gameScoreState.homeTeamScore +
        gameScoreState.awayTeamScore,
    };
  },
);
```

### Unsafe get a state without Freeze

Demonstration of obtaining a store's state without a `Freeze`, emphasizing the potential undefined behavior (UB) that may arise if the state is altered.

```typescript
import { store } from "@renewx/core";

const player = store({ name: "LeBron James", age: 36 });
const freezeState = player.get(); // Freeze<{ name: string, age: number }>
// IMPORTANT!!! This is indeed unsafe, as if you alter the state,
// it will lead to Undefined Behavior (UB)!!!
const unsafeState = player.unsafe(); // { name: string, age: number }
```

### Combining Features

Combining various features of `RenewX` to manage and derive state in a more complex scenario.

```typescript
import { store, action, watch, tx } from "@renewx/core";

// Assume we have another store for managing teams
const initialTeamData = { teamId: 1, teamName: "Lakers", teamScore: 0 };
const teamData = store(initialTeamData);

// Create an action to update team score based on individual user scores
const updateTeamScore = action(teamData, (state, additionalScore) => {
  return { teamScore: state.teamScore + additionalScore };
});

// Create a transaction to reset user score and update team score
const resetAndUpdate = tx(
  [userData, teamData],
  async ([userTxState, teamTxState], bonusScore: number, penaltyScore: number) => {
    // Reset user score
    userTxState.set({ userScore: 0 });

    // Simulate async operation, e.g., fetching data from server
    const teamBonusScore = await new Promise((resolve) =>
      setTimeout(() => resolve(bonusScore), 2000),
    );

    // Apply penalty if any
    const currentTeamScore = teamTxState.get().teamScore;
    const newTeamScore = currentTeamScore + teamBonusScore - penaltyScore;
    teamTxState.set({ teamScore: newTeamScore });

    return { newTeamScore };
  },
);

// Watch the team score
watch(teamData, (state) => {
  console.log("Team Score:", state.teamScore);
});

// Execute the transaction with additional arguments
resetAndUpdate(100, 20) // bonusScore = 100, penaltyScore = 20
  .then((result) => {
    console.log("Transaction committed with result:", result);
  })
  .catch((reason) => {
    console.error("Transaction rolled back due to:", reason);
  });
```

### Accessing a Read-Only Version of Store

In this example, we showcase how to access a read-only version of a store using the `readOnly` property. This allows for monitoring state changes without the ability to modify the state through actions. This can be particularly useful in scenarios where you want to ensure that certain parts of your code are only able to read the state, not modify it.

```typescript
import { store, action, watch } from "@renewx/core";

// Initial state for team score
const teamScore = store(0);

// Action to update team score
const updateScore = action(
  teamScore,
  (currentScore, points: number) => currentScore + points,
  "updateScore",
);

// Accessing a read-only version of the store
watch(teamScore.readOnly, (score) => {
  console.log("Team score:", score);
});

// Initial Team score: 0
updateScore(10); // Team score: 10
updateScore(3); // Team score: 13
```

### Optimizing Adapter Creation with Batch

This example demonstrates how to optimize the creation of adapters for a store using the `batch` method. By batching the creation of adapters, you significantly reduce the time it takes to process, especially when dealing with a large number of adapters. The adapters are stored in `totalScoreAdapters` and `optimizedTotalScoreAdapters` arrays for further use.

```typescript
import { store, adapter, batch } from "@renewx/core";

let start: number;
let end: number;

// Assume we have a list of players with their respective scores
const players = Array(1000)
  .fill(0)
  .map((_, i) => ({ id: i, score: i * 2 }));

// Initial state
const teamScore = store(0);

// Function for creating adapters to calculate the total score, considering both player and team scores
const createTotalScoreAdapter = (player) =>
  adapter(teamScore, (state) => state + player.score);

// Without batching
start = performance.now();
const totalScoreAdapters = players.map(createTotalScoreAdapter);
end = performance.now();

console.log(end - start); // Hypothetical time: 1178ms

// or...
// With batching
start = performance.now();
batch.stores.start();
const optimizedTotalScoreAdapters = players.map(createTotalScoreAdapter);
batch.stores.end();
end = performance.now();

console.log(end - start); // Hypothetical time: 25ms
```

## Documentation

Currently, the documentation is being developed. However, you can find a couple of examples for each module within the library to get started. More comprehensive documentation will be provided in the near future.
