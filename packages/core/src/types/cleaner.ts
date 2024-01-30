import type { Unsubscribe } from "./core";
import type { HasOff, Off } from "./off";

export type Disposable = HasOff | Unsubscribe | undefined | null;

export interface Cleaner extends Off {
  add(...items: Disposable[]): void;
  remove(item: Disposable): void;
}
