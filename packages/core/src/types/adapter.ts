import type {
  AnyStore,
  AnyStoreFreezeState,
  AnyStoresFreezeStates,
} from "./any-store";
import type { AdapterTag } from "./tag";
import type { Config } from "./config";
import type { ReadOnlyStore } from "./read-only-store";

export interface Adapter {
  <ToState extends any[], Stores extends AnyStore[]>(
    stores: [...Stores],
    adapt: (
      states: [...AnyStoresFreezeStates<Stores>],
      isFirst: boolean,
    ) => [...ToState],
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState extends any[], Store extends AnyStore>(
    store: Store,
    adapt: (
      state: AnyStoreFreezeState<Store>,
      isFirst: boolean,
    ) => [...ToState],
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState, Stores extends AnyStore[]>(
    stores: [...Stores],
    adapt: (
      states: [...AnyStoresFreezeStates<Stores>],
      isFirst: boolean,
    ) => ToState,
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState, Store extends AnyStore>(
    store: Store,
    adapt: (state: AnyStoreFreezeState<Store>, isFirst: boolean) => ToState,
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;
}

export interface AdapterStore<ToState>
  extends ReadOnlyStore<ToState, AdapterTag> {}
