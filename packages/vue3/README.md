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

```vue
<template>
  <h1 v-if="isShow">{{ User.nickname }}</h1>
  <button v-on:click="isShow = !isShow">Toggle me</button>
</template>

<script setup lang="ts">
  import { useStore } from "@renewx/vue3";
  import { user, isShow } from "../stores/user";

  const User = useStore(user);
  const IsShow = useStore(isShow);
</script>
```

## Docs

Read full docs **[here](https://github.com/adv0cat/renewx#readme)**.
