import type { Cleaner, Off } from "../types/cleaner";
import type { HasStore } from "../types/has-store";
import { cleaner } from "./cleaner";

export const creator =
  <Args extends unknown[], Type extends HasStore>(
    fn: (cleaner: Cleaner, ...v: Args) => Type & { readonly off?: never },
  ): ((...v: Args) => Type & Off) =>
  (...args) => {
    const _cleaner = cleaner();
    const instance = fn(_cleaner, ...args);

    _cleaner.add(instance.store);
    return Object.assign(instance, { off: _cleaner.off });
  };
