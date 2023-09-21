import type { AnyStore } from "../types/any-store";
import type { Unsubscribe } from "../types/core";
import { isNotLastWatcher, getWatchers } from "../api/queue-api";
import { getAddInfo } from "../api/action-api";
import type { ActionInfo } from "../types/action";
import { isStateChanged } from "../utils/is";
import { type Config, configMerge } from "../types/config";
import type { Watch, Watcher } from "../types/watch";

const noop = () => {};

export const watch: Watch = <Stores extends AnyStore | AnyStore[]>(
  store: Stores,
  watcher: (states: any, info?: ActionInfo) => Unsubscribe | void,
  config: Partial<Config> = {},
): Unsubscribe => {
  const { optimizeStateChange } = configMerge(config);

  const isSingleStore = !Array.isArray(store);
  const stores = isSingleStore ? [store] : store;

  let fromStates = stores.map((store) => store.get());

  // First run here
  if (isSingleStore) {
    watcher(
      fromStates[0],
      getAddInfo() ? { id: -1, path: [store.id] } : undefined,
    );
  } else {
    watcher(fromStates, getAddInfo() ? { id: -1, path: [] } : undefined);
  }

  let unsubscribes = stores.map((store, index) => {
    const storeID = store.id;
    const watchers = getWatchers<any>(storeID);

    const storeWatcher: Watcher<any> = (newState, info): Unsubscribe | void => {
      if (!optimizeStateChange) {
        fromStates[index] = newState;
        return watcher(isSingleStore ? newState : fromStates, info);
      } else if (isStateChanged(fromStates[index], newState)) {
        fromStates = stores.map((store) => store.get());
        return watcher(isSingleStore ? newState : fromStates, info);
      }
    };

    watchers.set(storeWatcher, noop);

    return (() => {
      if (isNotLastWatcher(storeWatcher)) {
        (watchers.get(storeWatcher) || noop)();
      }
      watchers.delete(storeWatcher);
    }) as Unsubscribe;
  });

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
    unsubscribes = [];
  };
};
