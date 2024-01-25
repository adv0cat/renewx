import type { Unsubscribe } from "./core";
import type { Off } from "./off";

export type Disposable = Off | Unsubscribe | undefined | null;

export interface Cleaner extends Off {
  add(...items: Disposable[]): void;
  remove(item: Disposable): void;
}
