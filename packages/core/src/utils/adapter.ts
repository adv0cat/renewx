import type { Freeze } from "./freeze";
import type { AnyStore, ReadOnlyStore } from "./store";
import type { AdapterTag } from "./tag";
import type { Config } from "./config";

export interface Adapter {
  <ToState extends any[], Stores extends AnyStore[]>(
    stores: [...Stores],
    action: (...state: AdapterStoresType<Stores>) => [...ToState],
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;
  <ToState, Stores extends AnyStore[]>(
    stores: [...Stores],
    action: (...state: AdapterStoresType<Stores>) => ToState,
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;
  <ToState extends any[], Store extends AnyStore>(
    store: Store,
    action: (state: AdapterStoreType<Store>) => [...ToState],
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;
  <ToState, Store extends AnyStore>(
    store: Store,
    action: (state: AdapterStoreType<Store>) => ToState,
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;
}

export type AdapterStoreType<SomeStore extends AnyStore> =
  SomeStore extends AnyStore<infer Type> ? Freeze<Type> : never;
export type AdapterStoresType<Stores extends AnyStore[]> = {
  [Index in keyof Stores]: AdapterStoreType<Stores[Index]>;
};

export interface AdapterStore<ToState>
  extends ReadOnlyStore<ToState, AdapterTag> {}

export interface AdapterAction {
  <ToState, Stores extends AnyStore[]>(
    ...state: AdapterStoresType<Stores>
  ): ToState;
  <ToState, Store extends AnyStore>(state: AdapterStoreType<Store>): ToState;
}
