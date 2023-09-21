import type {
  AnyStore,
  AnyStoresFreezeStates,
  AnyStoreFreezeState,
} from "./any-store";
import type { AdapterTag } from "./tag";
import type { Config } from "./config";
import type { ReadOnlyStore } from "./read-only-store";

export interface Adapter {
  <ToState extends any[], Stores extends AnyStore[]>(
    stores: [...Stores],
    action: (...state: AnyStoresFreezeStates<Stores>) => [...ToState],
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState extends any[], Store extends AnyStore>(
    store: Store,
    action: (state: AnyStoreFreezeState<Store>) => [...ToState],
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState, Stores extends AnyStore[]>(
    stores: [...Stores],
    action: (...state: AnyStoresFreezeStates<Stores>) => ToState,
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;

  <ToState, Store extends AnyStore>(
    store: Store,
    action: (state: AnyStoreFreezeState<Store>) => ToState,
    name?: string,
    config?: Partial<Config>,
  ): AdapterStore<ToState>;
}

export interface AdapterStore<ToState>
  extends ReadOnlyStore<ToState, AdapterTag> {}

export interface AdapterAction {
  <ToState, Stores extends AnyStore[]>(
    ...state: AnyStoresFreezeStates<Stores>
  ): ToState;

  <ToState, Store extends AnyStore>(state: AnyStoreFreezeState<Store>): ToState;
}
