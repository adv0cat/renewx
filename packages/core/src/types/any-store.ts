import type { AnyTag } from "./tag";
import type { Freeze } from "./freeze";
import type { ReadOnlyStore } from "./read-only-store";

export type AnyStore<
  State = any,
  TagType extends AnyTag = AnyTag,
> = ReadOnlyStore<State, TagType>;

export type AnyStoreType<SomeStore extends AnyStore> =
  SomeStore extends AnyStore<infer Type> ? Freeze<Type> : never;
export type AnyStoresType<Stores extends AnyStore[]> = {
  [Index in keyof Stores]: AnyStoreType<Stores[Index]>;
};

export const isAnyStore = (v: any): v is AnyStore =>
  "id" in v &&
  Number.isInteger(v.id) &&
  "tag" in v &&
  typeof v.tag === "string" &&
  "isReadOnly" in v;
