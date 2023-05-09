import type {
  AnyStore,
  FreezeStoreListType,
  FreezeStoreType,
  ReadOnlyStore,
} from "./store";

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
