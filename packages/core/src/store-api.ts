import type { StoreID } from "./utils/id";
import type { AnyStore, InnerStore, ReadOnlyStore } from "./utils/store";
import type { Unsubscribe } from "./utils/core";

type Watcher = (storeID: StoreID) => void;
const watchers = [] as Watcher[];

const stores = [] as AnyStore[];
const add = <SomeStore extends ReadOnlyStore<any> | InnerStore<any>>(
  store: SomeStore
): SomeStore => {
  const storeID: StoreID = store.id;
  stores[storeID] = store;
  watchers.forEach((fn) => fn(storeID));
  return store;
};

const storeById = (storeID: StoreID): AnyStore | undefined => stores[storeID];
const storeList = () => stores.slice();

export const StoreInnerAPI = { add };
export const StoreAPI = {
  storeById,
  storeList,
  watch: (watcher: Watcher): Unsubscribe => {
    watchers.push(watcher);
    return () => {
      watchers.splice(watchers.indexOf(watcher), 1);
    };
  },
};
