import type { AnyTag, WritableTag } from "./tag";
import type { Freeze } from "./freeze";
import type { ReadOnlyStore } from "./read-only-store";
import type { ActionStore } from "./action-store";

export type AnyStore<
  State = any,
  TagType extends AnyTag = AnyTag,
> = ReadOnlyStore<State, TagType>;

export type AnyActionStore<
  State = any,
  TagType extends WritableTag = WritableTag,
> = ActionStore<State, TagType>;

export type AnyStoreFreezeState<SomeStore extends AnyStore> =
  SomeStore extends AnyStore<infer State> ? Freeze<State> : never;
export type AnyStoresFreezeStates<Stores extends AnyStore[]> = {
  [Index in keyof Stores]: AnyStoreFreezeState<Stores[Index]>;
};

export type AnyStoreState<SomeStore extends AnyStore> =
  SomeStore extends AnyStore<infer State> ? State : never;
export type AnyStoresStates<Stores extends AnyStore[]> = {
  [Index in keyof Stores]: AnyStoreState<Stores[Index]>;
};
