import type { StoreID } from "../interfaces/id";
import type { AnyStore, InnerStore, ReadOnlyStore } from "../interfaces/store";

type Watcher = {
  watch: (storeID: StoreID) => void;
};
const watchers = [] as Watcher[];
const watcher = (watcher: Watcher): void => {
  watchers.push(watcher);
};

const stores = [] as AnyStore[];
const add = <SomeStore extends ReadOnlyStore<any> | InnerStore<any>>(
  store: SomeStore
): SomeStore => {
  const storeID: StoreID = store.id;
  stores[storeID] = store;
  watchers.forEach(({ watch }) => watch(storeID));
  return store;
};

const storeById = (storeID: StoreID): AnyStore | undefined => stores[storeID];
const storeList = () => stores.slice();

export const StoreInnerAPI = { add };
export const StoreAPI = {
  storeById,
  storeList,
  watcher,
};
