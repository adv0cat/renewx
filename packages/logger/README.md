# @renewx/logger

[![npm version](https://img.shields.io/npm/v/@renewx/logger.svg?style=flat)](https://www.npmjs.com/package/@renewx/logger) [![npm version](https://deno.bundlejs.com/?q=@renewx/logger&treeshake=[{+initLogger+}]&badge=)](https://www.npmjs.com/package/@renewx/logger) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/adv0cat/renewx/blob/main/LICENSE)

## Install

```shell
npm i @renewx/logger
```

## Usage

#### Add to the start of the **_index.ts_** file, and the logs will automatically appear in the console:

```ts
import { initLogger } from "@renewx/logger";

initLogger(console.log);
```
