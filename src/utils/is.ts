import type { AnyStore, Store } from "../interfaces/store";

export const isNotReadOnlyStore = (store: AnyStore): store is Store<any> => !store.isReadOnly
