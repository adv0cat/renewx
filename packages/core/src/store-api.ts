import type { StoreID } from "./utils/id";
import type { AnyStore } from "./utils/store";
import type { Unsubscribe } from "./utils/core";

type StoreApiWatcher = (storeID: StoreID) => void;
const watchers = [] as StoreApiWatcher[];

const stores = [] as AnyStore[];
const add = <SomeStore extends AnyStore>(store: SomeStore): SomeStore => {
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
  watch: (watcher: StoreApiWatcher): Unsubscribe => {
    watchers.push(watcher);
    return () => {
      watchers.splice(watchers.indexOf(watcher), 1);
    };
  },
};
