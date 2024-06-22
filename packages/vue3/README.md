# @renewx/vue3

[![npm version](https://img.shields.io/npm/v/@renewx/vue3.svg?style=flat)](https://www.npmjs.com/package/@renewx/vue3) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/adv0cat/renewx/blob/main/LICENSE)

## Installation

Install via npm:

```bash
npm i @renewx/vue3
```

Or via yarn:

```bash
yarn add @renewx/vue3
```

## Usage

### Store state

Subscribe to store changes and use reactive store state

> ⚠️ But remember that `useStore` returns `ShallowRef<Freeze<T>>`

> ⚠️ If you're utilizing dynamically created `store` or `adapter`,
> it's important to pass `true` as the second parameter in `useStore`.
>
> > This indicates that upon exiting the `scope`, not only will
> the change listener be cleared, but `store.off()` will also be invoked,
> ensuring proper cleanup.

```vue
<script setup lang="ts">
  import { store } from "@renewx/core";
  import { useStore } from "@renewx/vue3";
  import { title } from "../stores/title";
  import { user } from "../stores/user";

  const Title = useStore(title);
  const User = useStore(user);
  const IsShow = useStore(store(false, "IS-SHOW"), { withOff: true });
</script>

<template>
  <h1 v-text="Title" />
  <button v-on:click="IsShow = !IsShow">Toggle me</button>
  <span v-if="IsShow">{{ User.nickname }}</span>
</template>
```

In `useStore`, you can pass a configuration object with the following parameters:

- `withOff: boolean` – when `true`, the store is automatically removed upon component unmount in Vue 3.
- `stateCheck: boolean` – when `false`, state change checks are disabled.

---

## Docs

Read full docs **[here](https://github.com/adv0cat/renewx#readme)**.
