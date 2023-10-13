# RenewX

[![npm version](https://img.shields.io/npm/v/@renewx/core.svg?style=flat)](https://www.npmjs.com/package/@renewx/core) [![npm version](https://deno.bundlejs.com/?q=@renewx/core&treeshake=[{+store,adapter,watch+}]&badge=)](https://www.npmjs.com/package/@renewx/core) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/adv0cat/renewx/blob/main/LICENSE)

## Install

```shell
npm i @renewx/core
```

## Usage

### Store

#### Managing an array of URLs:

```ts
import { store, watch } from "@renewx/core";

const urls = store<string[]>([]);

// Let's create an action that takes a URL
// and adds it to the array,
// returning a new array from the function,
// thereby changing the state
const addUrl = urls.newAction((state, url: string) => {
  return state.concat(url);
});

// Watching state changes returns an "unsubscribe" function;
// invoking it will stop the watching
const unsubscribe = watch(urls, (state) => {
  console.log("urls:", state);
});

// Let's call the action and pass the URL to it
addUrl("https://npmjs.com"); // urls: ["https://npmjs.com"]

// You can also set the value using the default "set" action
urls.set(["https://renewx.dev"]); // urls: ["https://renewx.dev"]

// After use, you can unsubscribe.
unsubscribe();
```

#### Managing DOM state and event handling:

```ts
import { store, watch } from "@renewx/core";

const element = store(document.getElementById("first"));

// Let's create an action that will take an nextElement
// and replace the current one with it
const nextElement = element.newAction((_, nextElement: HTMLElement) => {
  return nextElement;
});

// If you return a function in the "watch" callback,
// it will be invoked as an unsubscribe function when the state changes.
watch(element, (state) => {
  const onClick = () => console.log("click");
  state.addEventListener("click", onClick);
  return () => {
    state.removeEventListener("click", onClick);
  };
});

// After using the "first" element, we use the "second"
nextElement(document.getElementById("second"));
// or...
// The same element change, but through the default "set" action
element.set(document.getElementById("second"));
```

#### Watching multiple state stores using _watch_ function:

```ts
import { store, watch } from "@renewx/core";

const index = store(0);
const add = index.newAction((state, num: number) => state + num, "add");
const title = store("Title");

watch([index, title], ([index, title]) => {
  console.log(`index: ${index}, title: "${title}"`);
});

add(2); // index: 2, title: "Title"
title.set("Title of News"); // index: 2, title: "Title of News"
add(40); // index: 42, title: "Title of News"
```

#### Grouping multiple actions into a typed _Actions_ object for easier usage:

```ts
import { store, actions, watch } from "@renewx/core";

const index = actions(store(100), {
  add: (state, b: number) => state + b,
  minus: (state, b: number) => state - b,
  toZero: () => 0,
});

watch(index.store, (state) => {
  console.log("index:", state);
});

// index: 100
index.add(42); // index: 142
index.toZero(); // index: 0
index.minus(13); // index: -13
```

#### Capturing mouse event type in store with _stateCheck_:

```ts
import { store, watch } from "@renewx/core";

// First, we add a config for the store
// so that it can change the state without checking.
const event = store<string>("", "event", { stateCheck: false });
const onMouseEvent = event.newAction(
  (_, { type }: MouseEvent) => type,
  "onMouseEvent",
);

// Secondly, we add a config for the watch function
// so that it can look at the state without checking it.
watch(event, (event) => console.log("event:", event), { stateCheck: false });

document.addEventListener("click", onMouseEvent);
```

### Adapter

#### Converting page-based pagination to API pagination format:

```ts
import { store, adapter } from "@renewx/core";

interface PagePagination {
  pageSize: number;
  page: number;
}
interface ApiPagination {
  offset: number;
  limit: number;
}

const pagePagination = store<PagePagination>({
  pageSize: 10,
  page: 1,
});

const apiPagination = adapter(pagePagination, ({ pageSize, page }) => {
  const limit = page * pageSize;
  return {
    offset: limit - pageSize,
    limit,
  } as ApiPagination;
});

console.log("apiPagination:", apiPagination.get()); // apiPagination: { offset: 0, limit: 10 }
```

#### Combined stores for use in an adapter:

```ts
import { store, adapter, watch } from "@renewx/core";

const pageSize = store(10);
const page = store(1);
const pagination = adapter([pageSize, page], (pageSize, page) => {
  const limit = page * pageSize;
  return {
    offset: limit - pageSize,
    limit,
  };
});

const nextPage = page.newAction((state) => state + 1);

watch(pagination, (state) => {
  console.log("pagination:", state);
});

// pagination: { offset: 0, limit: 10 }
nextPage(); // pagination: { offset: 10, limit: 20 }
nextPage(); // pagination: { offset: 20, limit: 30 }
```

### Validator

#### Validation of different stores with multiple levels

```ts
import { store, watch } from "@renewx/core";

interface Pagination {
  pageSize: number;
  page: number;
}

const pagination = store<Pagination>({
  pageSize: 10,
  page: 1,
});
const isLoading = store("not loading");

pagination.validator((_, state) => state.page > 0);
isLoading.validator(
  (old, state) =>
    (old === "loading" && state === "not loading") ||
    (old === "not loading" && state === "loading"),
);

watch([pagination, isLoading], ([{ page }, isLoading]) => {
  console.log(`page: ${page}, isLoading: "${isLoading}"`);
});

isLoading.set("loading"); // isLoading: "loading" - changed, because from "not loading" to "loading"
isLoading.set("not loading"); // isLoading: "not loading" - changed, because from "loading" to "not loading"
isLoading.set("wrong value"); // not changed, because from "not loading" to "wrong value"

const loadPrevPage = pagination.newAction(({ page, pageSize }) => ({
  page: page - 1,
  pageSize,
}));
const loadNextPage = pagination.newAction(({ page, pageSize }) => ({
  page: page + 1,
  pageSize,
}));

loadPrevPage(); // not changed, because state.page === 0 in pagination validator
loadNextPage(); // page: 2
loadPrevPage(); // page: 1
loadPrevPage(); // not changed, because state.page === 0 in pagination validator
```

### ReadOnly

#### Returning a read-only store

```ts
import { store, watch } from "@renewx/core";

const count = store(0, "count");
const add = count.newAction((count, num: number) => count + num, "add");

watch(count.readOnly, (state) => {
  console.log("count state:", state);
});

// count state: 0
add(10); // count state: 10
add(3); // count state: 13
```

### Unsafe

#### Unsafe get a state without Freeze

```ts
import { store, watch } from "@renewx/core";

const user = store({ name: "Jack", age: 42 }, "user");
const freezeState = user.get(); // Freeze<{ name: string, age: number }>
// IMPORTANT!!! This is indeed unsafe, as if you alter the state,
// it will lead to an Undefined Behaviour (UB)!!!
const unsafeState = user.unsafe(); // { name: string, age: number }
```

### Batch

#### Using batching for adapter store creation

```ts
import { store, adapter, batch } from "@renewx/core";

let start: number;
let end: number;

// Generating an array of numbers from 0 to 1000
const base = Array(1000)
  .fill(0)
  .map((_, i) => i);

// Initial state
const entry = store(0);

// Function for creating adapters
const createAdapter = (v: number) => adapter(entry, (state) => state + v);

// Without batching
start = performance.now();
base.map(createAdapter);
end = performance.now();

console.log(end - start); // 1178ms

// or...
// With batching
start = performance.now();
batch.stores.start();
base.map(createAdapter);
batch.stores.end();
end = performance.now();

console.log(end - start); // 25ms
```
