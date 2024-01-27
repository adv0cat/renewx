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
<script setup lang="ts">
  import { useStore } from "@renewx/vue3";
  import { title } from "../stores/title";
  import { user } from "../stores/user";
  import { isShow } from "../stores/isShow";

  const Title = useStore(title);
  const User = useStore(user);
  const IsShow = useStore(isShow);
</script>

<template>
  <h1 v-text="Title" />
  <button v-on:click="IsShow = !IsShow">Toggle me</button>
  <span v-if="IsShow">{{ User.nickname }}</span>
</template>
```

## Docs

Read full docs **[here](https://github.com/adv0cat/renewx#readme)**.
