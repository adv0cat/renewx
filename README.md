# Quench Store

## Install

```shell
npm i @adv0cat/quench-store
```

## Usage

Simple urls store:
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
const addUrl = urlsStore.action((state, url: string) => {
    return state.concat(url)
}, { id: "addUrl" })

// use action for change store
addUrl("https://npmjs.com")
```
