import type { AnyStore } from "../types/any-store";
import type { Unsubscribe } from "../types/core";
import { getFn, getUnWatchList, isNotLastWatcher } from "../api/queue-api";
import { getAddInfo } from "../api/action-api";
import type { ActionInfo } from "../types/action";
import { isStateChanged } from "../utils/is";
import type { Config } from "../types/config";
import type { Watch, Watcher } from "../types/watch";
import { mergeConfig } from "../main-config";

export const watch: Watch = <Stores extends AnyStore | AnyStore[]>(
  store: Stores,
  watcher: (states: any, info?: ActionInfo) => Unsubscribe | void,
  config: Partial<Config> = {},
): Unsubscribe => {
  const { stateCheck } = mergeConfig(config);

  const isSingleStore = !Array.isArray(store);
  const stores = isSingleStore ? [store] : store;

  let fromStates = stores.map((store) => store.get());

  let unsubscribes = stores.map((store, index) => {
    const storeID = store.id;
    const unWatchList = getUnWatchList<any>(storeID);

    const storeWatcher: Watcher<any> = (newState, info): Unsubscribe | void => {
      if (!stateCheck) {
        fromStates[index] = newState;
        return watcher(isSingleStore ? newState : fromStates, info);
      } else if (isStateChanged(fromStates[index], newState)) {
        return watcher(
          isSingleStore
            ? (fromStates[index] = newState)
            : (fromStates = stores.map(({ get }) => get())),
          info,
        );
      }
    };

    // First run watcher here
    unWatchList.set(
      storeWatcher,
      getFn(
        watcher(
          isSingleStore ? fromStates[0] : fromStates,
          getAddInfo()
            ? ({ id: -1, path: isSingleStore ? [storeID] : [] } as ActionInfo)
            : undefined,
        ),
      ),
    );

    return (() => {
      if (isNotLastWatcher(storeWatcher)) {
        unWatchList.get(storeWatcher)!();
      }
      unWatchList.delete(storeWatcher);
    }) as Unsubscribe;
  });

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
    unsubscribes = [];
  };
};
