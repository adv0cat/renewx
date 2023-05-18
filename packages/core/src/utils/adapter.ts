import type { Freeze } from "./freeze";
import type { AnyStore, ReadOnlyStore } from "./store";

export type FreezeStoreType<SomeStore extends AnyStore> =
  SomeStore extends AnyStore<infer Type> ? Freeze<Type> : never;
export type FreezeStoreListType<SomeStoreList extends AnyStore[]> = {
  [Index in keyof SomeStoreList]: FreezeStoreType<SomeStoreList[Index]>;
};

export interface Adapter {
  <ToState, Stores extends AnyStore[]>(
    stores: [...Stores],
    adapterAction: (...states: FreezeStoreListType<Stores>) => ToState,
    name?: string
  ): ReadOnlyStore<ToState>;
  <ToState, Store extends AnyStore>(
    store: Store,
    adapterAction: (state: FreezeStoreType<Store>) => ToState,
    name?: string
  ): ReadOnlyStore<ToState>;
}

export type AdapterAction<
  ToState,
  Stores extends AnyStore | AnyStore[] = AnyStore[]
> = Stores extends AnyStore[]
  ? (...state: FreezeStoreListType<Stores>) => ToState
  : Stores extends AnyStore
  ? (state: FreezeStoreType<Stores>) => ToState
  : never;
