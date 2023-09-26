# @renewx/core

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
import { store } from "@renewx/core";

const event = store<string>("", "event", { stateCheck: false });
const onMouseEvent = event.newAction(
  (_, { type }: MouseEvent) => type,
  "onMouseEvent",
);

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
import { adapter, watch } from "@renewx/core";

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

### Join

#### Joining multiple stores for convenient use:

```ts
import { store, join, watch } from "@renewx/core";

const isLoading = store(false);
const urls = store<string[]>([]);
const loading = join({ isLoading, urls });

watch(loading, ({ isLoading, urls }) => {
  console.log("urls:", urls, "isLoading:", isLoading);
});

const addUrl = loading.newAction(({ isLoading, urls }, url: string) => {
  if (!isLoading) {
    return { urls: urls.concat(url) };
  }
});

isLoading.set(true); // urls: [] isLoading: true
addUrl("https://npmjs.com"); // urls: ["https://npmjs.com"] isLoading: true
addUrl("https://google.com"); // urls: ["https://npmjs.com"] isLoading: true
isLoading.set(false); // urls: ["https://npmjs.com"] isLoading: false
addUrl("https://google.com"); // urls: ["https://npmjs.com", "https://google.com"] isLoading: true
```

### Validator

#### Validation of different stores with multiple levels

```ts
import { store, join, watch } from "@renewx/core";

interface Pagination {
  pageSize: number;
  page: number;
}

const pagination = store<Pagination>({
  pageSize: 10,
  page: 1,
});
const isLoading = store(false);
const pageLoading = join({ pagination, isLoading });

pagination.validator((old, state) => state.page > 0);
pageLoading.validator((old, state) => {
  const isLoadingTurnOn = !old.isLoading && !!state?.isLoading;
  const isPageChanged = old.pagination.page != state?.pagination?.page;
  return isLoadingTurnOn ? isPageChanged : false;
});

const loadPrevPage = pageLoading.newAction(
  ({ pagination: { page, pageSize } }) => {
    return { isLoading: true, pagination: { page: page - 1, pageSize } };
  },
);
const loadNextPage = pageLoading.newAction(
  ({ pagination: { page, pageSize } }) => {
    return { isLoading: true, pagination: { page: page + 1, pageSize } };
  },
);

watch(pageLoading, ({ pagination: { page } }) => console.log("page:", page));

loadPrevPage(); // not changed, because state.page === 0 in pagination validator
loadNextPage(); // page: 2
loadPrevPage(); // not changed, because isLoadingTurnOn=false in pageLoading validator
isLoading.set(false); // page: 2, because isLoading state changed
loadPrevPage(); // page: 1
```

### ReadOnly

#### Returning a read-only store

```ts
import { store, watch } from "@renewx/core";

const count = store(0, "count");
const add = count.newAction((count, num: number) => count + num, "add");

const readOnlyCount = count.readOnly();
watch(readOnlyCount, (state) => {
  console.log("count state:", state);
});

// count state: 0
add(10); // count state: 10
add(3); // count state: 13
```
