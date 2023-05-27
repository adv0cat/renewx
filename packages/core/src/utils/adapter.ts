import type { Freeze } from "./freeze";
import type { AnyStore, ReadOnlyStore } from "./store";
import type { AdapterMark } from "./mark";

export type AdapterStoreType<SomeStore extends AnyStore> =
  SomeStore extends AnyStore<infer Type> ? Freeze<Type> : never;
export type AdapterStoresType<Stores extends AnyStore[]> = {
  [Index in keyof Stores]: AdapterStoreType<Stores[Index]>;
};

export interface Adapter {
  <ToState, Stores extends AnyStore[]>(
    stores: [...Stores],
    adapterAction: (...states: AdapterStoresType<Stores>) => ToState,
    name?: string
  ): ReadOnlyStore<ToState, AdapterMark>;
  <ToState, Store extends AnyStore>(
    store: Store,
    adapterAction: (state: AdapterStoreType<Store>) => ToState,
    name?: string
  ): ReadOnlyStore<ToState, AdapterMark>;
}

// FIXME: maybe type to interface
// FIXME: extends in Adapter or AdapterAction extends Adapter
export type AdapterAction<
  ToState,
  Stores extends AnyStore | AnyStore[] = AnyStore[]
> = Stores extends AnyStore[]
  ? (...state: AdapterStoresType<Stores>) => ToState
  : Stores extends AnyStore
  ? (state: AdapterStoreType<Stores>) => ToState
  : never;
