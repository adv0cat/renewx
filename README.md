# Quench Store

## Install

```shell
npm i @adv0cat/quench-store
```

## Usage

Example of urls store:
```ts
import { store } from "@adv0cat/quench-store"

// create store
const urlsStore = store<string[]>([], { name: "urls" });

// listen store changes
urlsStore.listen((urls) => {
    // TODO: something with state changes
    console.log("[index] urls:", urls)
})

// create action for change store
const addUrl = urlsStore.action((urls, url: string) => {
    return urls.concat(url)
}, { id: "addUrl" })

// use action for change store
addUrl("https://npmjs.com")
```

Example of isLoading and urls stores:
```ts
import { store } from "@adv0cat/quench-store"

// create stores
const isLoadingStore = store(false, { name: "isLoading" });
const urlsStore = store<string[]>([], { name: "urls" });

// listen stores changes
urlsStore.listen((urls) => {
    // TODO: something with urls state changes
    console.log("[index] urls:", urls)
})
isLoadingStore.listen((isLoading) => {
    // TODO: something with isLoading state changes
    console.log("[index] isLoading:", isLoading)
})

// create actions for change stores
const addUrl = urlsStore.action((urls, url: string) => urls.concat(url), { id: "addUrl" })
const startLoading = isLoadingStore.action(() => true, { id: "startLoading" })
const endLoading = isLoadingStore.action(() => false, { id: "endLoading" })

// use actions for change stores
startLoading()
addUrl("https://npmjs.com")
endLoading()
```

Example of join store:
```ts
import { store, join } from "@adv0cat/quench-store"

// create stores
const isLoadingStore = store(false, { name: "isLoading" });
const urlsStore = store<string[]>([], { name: "urls" });
const loadingStore = join(isLoadingStore, urlsStore)

// listen store changes
loadingStore.listen(([urls, isLoading]) => {
    // TODO: something with state changes
    console.log("[index] urls:", urls, "isLoading:", isLoading)
})

// create actions for change stores
const addUrl = loadingStore.action((state, url: string) => {
    const [urls, isLoading] = state
    return isLoading ? state : [urls.concat(url), true]
}, { id: "addUrl" })
const endLoading = isLoadingStore.action(() => false, { id: "endLoading" })

// use actions for change stores
addUrl("https://npmjs.com") // this url will be added
addUrl("https://google.com") // this url will not be added
endLoading()
```
