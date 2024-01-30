import type { HasOff, Off } from "./off";
import type { AnyActionStore, AnyStore } from "./any-store";
import type { WritableTag } from "./tag";
import type { ActionStore } from "./action-store";
import type { ReadOnlyStore } from "./read-only-store";

export type WithOff<Type> = Type extends HasOff ? Type : Type & Off;

export type HasStore<Store extends AnyActionStore | AnyStore = AnyStore> = {
  store: Store;
};
export type HasStoreWith<
  State,
  TagType extends WritableTag = WritableTag,
> = HasStore<ActionStore<State, TagType>>;
export type HasReadOnlyStoreWith<State> = HasStore<ReadOnlyStore<State>>;
