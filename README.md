# Quench Store

## Install

```shell
npm i quench-store
```

## Usage

### Store

#### urls store:

```ts
import { store } from "quench-store";

const urlsStore = store<string[]>([], { name: "urls" });

urlsStore.watch((urls) => {
    console.log("urls:", urls);
});

const addUrl = urlsStore.action((urls, url: string) => {
    return urls.concat(url);
}, { id: "addUrl" });

addUrl("https://npmjs.com"); // urls: ["https://npmjs.com"]
```

#### isLoading store:

```ts
import { store } from "quench-store";

const isLoadingStore = store(false, { name: "isLoading" });

isLoadingStore.watch((isLoading) => {
    console.log("isLoading:", isLoading);
});

const startLoading = isLoadingStore.action(() => true);
const endLoading = isLoadingStore.action(() => false);

startLoading(); // isLoading: true
endLoading();   // isLoading: false
```

### Join

#### loading store:

```ts
import { store, join } from "quench-store";

const isLoadingStore = store(false, { name: "isLoading" });
const urlsStore = store<string[]>([], { name: "urls" });
const loadingStore = join(isLoadingStore, urlsStore);

loadingStore.watch(([urls, isLoading]) => {
    console.log("urls:", urls, "isLoading:", isLoading);
});

const addUrl = loadingStore.action((state, url: string) => {
    const [urls, isLoading] = state;
    return isLoading ? state : [urls.concat(url), true];
});
const endLoading = isLoadingStore.action(() => false);

addUrl("https://npmjs.com");    // urls: ["https://npmjs.com"] isLoading: true
addUrl("https://google.com");   // urls: ["https://npmjs.com"] isLoading: true
endLoading();                   // urls: ["https://npmjs.com"] isLoading: false
addUrl("https://google.com");   // urls: ["https://npmjs.com", "https://google.com"] isLoading: true
```

### Job

#### loading store:

```ts
import { store, join, job } from "quench-store";

const isLoadingStore = store(false, { name: "isLoading" });
const urlStore = store("", { name: "url" });
const loadingStore = join(isLoadingStore, urlStore);

loadingStore.watch(([isLoading, url]) => {
    console.log("isLoading:", isLoading, "url:", url);
});

const startLoading = isLoadingStore.action(() => true);
const endLoading = isLoadingStore.action(() => false);

const setUrl = urlStore.action((state, url: string) => {
    return state.length === 0 ? url : state;
});

const loadData = job(async (url: string): Promise<unknown> => {
    setUrl(url);
    startLoading();
    const storeUrl = urlStore.get();
    const response = await fetch(storeUrl);
    const data = await response.json();
    endLoading();

    return data;
});

loadData("https://example.com/api")
    .then((data) => {
        console.log("data:", data);
    });
```

#### wait all jobs:

```ts
import { allJobs } from "quench-store";

// ...
await allJobs();
```
