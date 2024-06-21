import type { Cleaner, Off } from "../types/cleaner";
import type { HasStore } from "../types/add-off";
import { cleaner } from "./cleaner";

export const addOff =
  <Args extends unknown[], Type extends HasStore>(
    factory: (cleaner: Cleaner, ...v: Args) => Type,
  ): ((...v: Args) => Type & Off) =>
  (...args) => {
    const _cleaner = cleaner();
    const instance = factory(_cleaner, ...args);

    _cleaner.add(instance.store);
    return Object.assign(instance, { off: _cleaner.off });
  };
