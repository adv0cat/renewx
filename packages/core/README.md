# @renewx/core

[![npm version](https://img.shields.io/npm/v/@renewx/core.svg?style=flat)](https://www.npmjs.com/package/@renewx/core) [![npm version](https://deno.bundlejs.com/?q=@renewx/core&treeshake=[{+store,adapter,join+}]&badge=)](https://www.npmjs.com/package/@renewx/core) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/adv0cat/renewx/blob/main/LICENSE)

## Install

```shell
npm i @renewx/core
```

## Usage

### Store

#### Managing an array of URLs:

```ts
import { store } from "@renewx/core";

const urls = store<string[]>([]);

urls.watch((state) => {
  console.log("urls:", state);
});

const addUrl = urls.updater((state, url: string) => {
  return state.concat(url);
});

addUrl("https://npmjs.com"); // urls: ["https://npmjs.com"]
```

#### Managing DOM state and event handling:

```ts
import { store } from "@renewx/core";

const div = store(document.createElement("div"));

div.watch((state) => {
  const onClick = () => console.log("click");
  state.addEventListener("click", onClick);
  return () => {
    state.removeEventListener("click", onClick);
  };
});
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
import { adapter } from "@renewx/core";

const pageSize = store(10);
const page = store(1);
const pagination = adapter([pageSize, page], (pageSize, page) => {
  const limit = page * pageSize;
  return {
    offset: limit - pageSize,
    limit,
  };
});

const nextPage = page.updater((state) => state + 1);

pagination.watch((state) => {
  console.log("pagination:", state);
});

// pagination: { offset: 0, limit: 10 }
nextPage(); // pagination: { offset: 10, limit: 20 }
nextPage(); // pagination: { offset: 20, limit: 30 }
```

### Join

#### Joining multiple stores for convenient use:

```ts
import { store, join } from "@renewx/core";

const isLoading = store(false);
const urls = store<string[]>([]);
const loading = join({ isLoading, urls });

loading.watch(({ isLoading, urls }) => {
  console.log("urls:", urls, "isLoading:", isLoading);
});

const startLoading = isLoading.updater(() => true);
const endLoading = isLoading.updater(() => false);

const addUrl = loading.updater(({ isLoading, urls }, url: string) => {
  if (!isLoading) {
    return { urls: urls.concat(url) };
  }
});

startLoading(); // urls: [] isLoading: true
addUrl("https://npmjs.com"); // urls: ["https://npmjs.com"] isLoading: true
addUrl("https://google.com"); // urls: ["https://npmjs.com"] isLoading: true
endLoading(); // urls: ["https://npmjs.com"] isLoading: false
addUrl("https://google.com"); // urls: ["https://npmjs.com", "https://google.com"] isLoading: true
```

### Validation

#### Validation of different stores with multiple levels

```ts
import { store, join } from "@renewx/core";

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

pagination.validation((old, state) => state.page > 0);
pageLoading.validation((old, state) => {
  const isLoadingTurnOn = !old.isLoading && !!state?.isLoading;
  const isPageChanged = old.pagination.page != state?.pagination?.page;
  return isLoadingTurnOn ? isPageChanged : false;
});

const endLoading = isLoading.updater(() => false);
const loadPrevPage = pageLoading.updater(
  ({ pagination: { page, pageSize } }) => {
    return { isLoading: true, pagination: { page: page - 1, pageSize } };
  }
);
const loadNextPage = pageLoading.updater(
  ({ pagination: { page, pageSize } }) => {
    return { isLoading: true, pagination: { page: page + 1, pageSize } };
  }
);

pageLoading.watch(({ pagination: { page } }) => console.log("page:", page));

loadPrevPage(); // not changed, because state.page === 0 in pagination validation
loadNextPage(); // page: 2
loadPrevPage(); // not changed, because isLoadingTurnOn=false in pageLoading validation
endLoading(); // page: 2, because isLoading state changed
loadPrevPage(); // page: 1
```
