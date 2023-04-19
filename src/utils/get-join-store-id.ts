import type { AnyStore, JoinStoreID } from "../interfaces/store";

export const getJoinStoreID = <Stores extends AnyStore[]>(stores: Stores): JoinStoreID => `<${ stores
    .map((store) => store.id())
    .join(":") }>JoinStore`
