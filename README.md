# Quench Store
[![npm version](https://img.shields.io/npm/v/quench-store.svg?style=flat)](https://www.npmjs.com/package/quench-store) [![npm version](https://deno.bundlejs.com/?q=quench-store&treeshake=[{+store,adapter,join,job,allJobs+}]&badge=)](https://www.npmjs.com/package/quench-store) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/adv0cat/quench-store/blob/main/LICENSE)

## Install

```shell
npm i quench-store
```

## Usage

### Store

#### Managing an array of URLs:

```ts
import { store } from "quench-store";

const urls = store<string[]>([]);

urls.watch((state) => {
    console.log("urls:", state);
});

const addUrl = urls.action((state, url: string) => {
    return state.concat(url);
});

addUrl("https://npmjs.com"); // urls: ["https://npmjs.com"]
```

#### Managing DOM state and event handling:

```ts
import { store } from "quench-store";

const div = store(document.createElement('div'));

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
import { store, adapter } from "quench-store";

interface PagePagination {
    pageSize: number
    page: number
}
interface ApiPagination {
    offset: number
    limit: number
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

### Join

#### Joining multiple stores for convenient use:

```ts
import { store, join } from "quench-store";

const isLoading = store(false);
const urls = store<string[]>([]);
const loading = join({ isLoading, urls });

loading.watch(({ isLoading, urls }) => {
    console.log("urls:", urls, "isLoading:", isLoading);
});

const startLoading = isLoading.action(() => true);
const endLoading = isLoading.action(() => false);

const addUrl = loading.action(({ isLoading, urls }, url: string) => {
    if (!isLoading) {
        return { urls: urls.concat(url) };
    }
});

startLoading();               // urls: [] isLoading: true
addUrl("https://npmjs.com");  // urls: ["https://npmjs.com"] isLoading: true
addUrl("https://google.com"); // urls: ["https://npmjs.com"] isLoading: true
endLoading();                 // urls: ["https://npmjs.com"] isLoading: false
addUrl("https://google.com"); // urls: ["https://npmjs.com", "https://google.com"] isLoading: true
```

### Job

#### Asynchronous data modification using library job:

```ts
import { store, join, job } from "quench-store";

const isLoading = store(false);
const url = store("");
const loading = join({ isLoading, url });

loading.watch(({ isLoading, url }) => {
    console.log("isLoading:", isLoading, "url:", url);
});

const startLoading = isLoading.action(() => true);
const endLoading = isLoading.action(() => false);

const setUrl = url.action((state, url: string) => {
    return state.length === 0 ? url : state;
});

type ResponseData = { status: string };
const loadData = job(async (newUrl: string) => {
    startLoading();
    setUrl(newUrl);
    const response = await fetch(newUrl);
    const data = await response.json() as ResponseData;
    endLoading();

    return data;
});

loadData("https://example.com/api")
    .then((data) => {
        console.log("data:", data);
    });
```

#### Waiting for completion of all jobs asynchronously:

```ts
import { allJobs } from "quench-store";

// Waiting for all jobs to complete before continuing execution
await allJobs();
// All jobs have completed, continuing execution...
```
