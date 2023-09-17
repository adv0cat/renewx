import type { Unsubscribe } from "../types/core";

export const getUnsubscribe = (fn?: Unsubscribe | void): Unsubscribe =>
  typeof fn === "function" ? fn : () => {};
