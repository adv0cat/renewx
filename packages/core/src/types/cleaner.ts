import type { Unsubscribe } from "./core";

export interface Off {
  off(): void;
}

export type Disposable = Off | Unsubscribe | undefined | null;

export interface Cleaner extends Off {
  add(...items: Disposable[]): void;
  remove(item: Disposable): void;
}
