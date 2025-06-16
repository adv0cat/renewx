import { cleaner, Disposable, Unsubscribe } from "@renewx/core";

export const unsubscribe = (...items: Disposable[]): Unsubscribe =>
  cleaner(...items).off;
