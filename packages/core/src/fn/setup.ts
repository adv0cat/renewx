import type { Disposable, Off } from "../types/cleaner";
import { cleaner } from "./cleaner";

export const setup =
  <Args extends unknown[]>(
    fn: (...v: Args) => Disposable[] | Disposable,
  ): ((...v: Args) => Off) =>
  (...args) => {
    const items = fn(...args);
    return cleaner(...(Array.isArray(items) ? items : [items]));
  };
