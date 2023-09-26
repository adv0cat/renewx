import type { KeysOfObject } from "./core";
import type { AnyActionStore, AnyStore } from "./any-store";

export type OnlyActionStores<Stores extends Record<string, AnyStore>> = {
  [Index in keyof Stores]: Stores[Index] extends AnyActionStore<infer State>
    ? State
    : never;
};
export type KeysOfActionStores<Stores extends Record<string, AnyStore>> =
  KeysOfObject<OnlyActionStores<Stores>>;
