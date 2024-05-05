import type { AnyStore } from "../types/any-store";
import type { Unsubscribe } from "../types/core";
import { getFn, getUnWatchList, globalUnWatch } from "../api/queue-api";
import { getAddInfo } from "../api/action-api";
import type { ActionInfo } from "../types/action";
import { isStateChanged } from "../utils/is";
import type { Config } from "../types/config";
import type { Watch, Watcher, QueueWatcher } from "../types/watch";
import { mergeConfig } from "../main-config";

export const watch: Watch = <Stores extends AnyStore | AnyStore[]>(
  store: Stores,
  watcher: Watcher<any>,
  config: Partial<Config> = {},
): Unsubscribe => {
  const stateCheck = mergeConfig(config).stateCheck;

  const isSingleStore = !Array.isArray(store);
  const stores = (isSingleStore ? [store] : store) as AnyStore[];

  let fromStates = stores.map((store) => store.get());

  let unWatch: any;
  const mainUnWatch = () => {
    const fn = getFn(unWatch);
    unWatch = 0;
    fn();
  };

  const watchers = stores.map<
    [QueueWatcher<any>, Map<QueueWatcher<any>, Unsubscribe>]
  >(({ id }, index) => {
    const storeWatch: QueueWatcher<any> = (newState, info): Unsubscribe => {
      if (!stateCheck) {
        fromStates[index] = newState;
        unWatch = watcher(isSingleStore ? newState : fromStates, false, info);
      } else if (isStateChanged(fromStates[index], newState)) {
        unWatch = watcher(
          isSingleStore
            ? (fromStates[index] = newState)
            : (fromStates = stores.map(({ get }) => get())),
          false,
          info,
        );
      }

      return mainUnWatch;
    };

    return [storeWatch, getUnWatchList(id).set(storeWatch, mainUnWatch)];
  });

  try {
    // First run watcher here
    unWatch = watcher(
      isSingleStore ? fromStates[0] : fromStates,
      true,
      getAddInfo()
        ? ({
            id: -1,
            path: isSingleStore ? [store.id] : [],
          } as ActionInfo)
        : undefined,
    );
  } catch (e) {
    console.error(e);
  }

  return () =>
    watchers
      .splice(0, watchers.length)
      .map(
        ([storeWatcher, unWatchList]) =>
          globalUnWatch(storeWatcher) && unWatchList.delete(storeWatcher),
      )
      .some((v) => v) && mainUnWatch();
};
