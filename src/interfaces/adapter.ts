import type {
  AnyStore,
  FreezeStoreListType,
  FreezeStoreType,
  ReadOnlyStore,
  StoreOptions,
} from "./store";

export interface Adapter {
  <ToState, Stores extends AnyStore[]>(
    stores: [...Stores],
    adapterAction: (...states: FreezeStoreListType<Stores>) => ToState,
    options?: StoreOptions
  ): ReadOnlyStore<ToState>;
  <ToState, Store extends AnyStore>(
    store: Store,
    adapterAction: (state: FreezeStoreType<Store>) => ToState,
    options?: StoreOptions
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
