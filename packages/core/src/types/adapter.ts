import type { AnyStore, AnyStoresType, AnyStoreType } from "./any-store";
import type { ReadOnlyStore } from "./store";
import type { AdapterTag } from "./tag";
import type { Config } from "./config";

export interface Adapter {
  <ToState extends any[], Stores extends AnyStore[]>(
    stores: [...Stores],
    action: (...state: AnyStoresType<Stores>) => [...ToState],
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState, Stores extends AnyStore[]>(
    stores: [...Stores],
    action: (...state: AnyStoresType<Stores>) => ToState,
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState extends any[], Store extends AnyStore>(
    store: Store,
    action: (state: AnyStoreType<Store>) => [...ToState],
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState, Store extends AnyStore>(
    store: Store,
    action: (state: AnyStoreType<Store>) => ToState,
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;
}

export interface AdapterStore<ToState>
  extends ReadOnlyStore<ToState, AdapterTag> {}

export interface AdapterAction {
  <ToState, Stores extends AnyStore[]>(
    ...state: AnyStoresType<Stores>
  ): ToState;

  <ToState, Store extends AnyStore>(state: AnyStoreType<Store>): ToState;
}
