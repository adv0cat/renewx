import type { Unsubscribe } from "../types/core";
import type { Disposable } from "../types/cleaner";
import { cleaner } from "./cleaner";

export const unsubscribe = (...items: Disposable[]): Unsubscribe =>
  cleaner(...items).off;
