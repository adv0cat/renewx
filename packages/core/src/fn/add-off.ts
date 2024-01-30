import type { HasOff } from "../types/off";
import type { Cleaner } from "../types/cleaner";
import type { HasStore, WithOff } from "../types/add-off";
import { cleaner } from "./cleaner";

export const addOff =
  <Args extends unknown[], Type extends HasStore>(
    factory: (cleaner: Cleaner, ...v: Args) => Type,
  ): ((...v: Args) => WithOff<Type>) =>
  (...args) => {
    const _cleaner = cleaner();

    const result = factory(_cleaner, ...args);
    _cleaner.add(result.store);

    const _off = (result as Partial<HasOff>).off;
    (result as Partial<HasOff>).off = _off
      ? (...offArgs: any[]) => (_cleaner.off() as undefined) || _off(...offArgs)
      : _cleaner.off;
    return result as WithOff<Type>;
  };
