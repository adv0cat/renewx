import type { AnyTag } from "./tag";
import type { Freeze } from "./freeze";
import type { ReadOnlyStore } from "./read-only-store";

export type AnyStore<
  State = any,
  TagType extends AnyTag = AnyTag,
> = ReadOnlyStore<State, TagType>;

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

export const isAnyStore = (v: any): v is AnyStore =>
  "id" in v &&
  Number.isInteger(v.id) &&
  "tag" in v &&
  typeof v.tag === "string" &&
  "isReadOnly" in v;
