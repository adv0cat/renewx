import type { StoreID } from "../types/id";
import type { AnyStore } from "../types/any-store";
import type { Unsubscribe } from "../types/core";

type StoreApiWatcher = (storeID: StoreID) => void;

const watchers = [] as StoreApiWatcher[];
const stores = [] as AnyStore[];

export const saveStore = <SomeStore extends AnyStore>(
  store: SomeStore,
): SomeStore => {
  const storeID: StoreID = store.id;
  stores[storeID] = store;
  watchers.forEach((fn) => fn(storeID));
  return store;
};

export const StoreAPI = {
  storeById: (storeID: StoreID): AnyStore | undefined => stores[storeID],
  storeList: () => stores.slice(0),
  watch: (watcher: StoreApiWatcher): Unsubscribe => {
    watchers.push(watcher);
    return () => {
      watchers.splice(watchers.indexOf(watcher), 1);
    };
  },
};
