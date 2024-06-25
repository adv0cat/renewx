import type { Cleaner, Off } from "../types/cleaner";
import { cleaner } from "./cleaner";

export const setup =
  <Args extends unknown[]>(
    fn: (cleaner: Cleaner, ...v: Args) => void,
  ): ((...v: Args) => Off) =>
  (...args) => {
    const _cleaner = cleaner();
    fn(_cleaner, ...args);
    return _cleaner;
  };
