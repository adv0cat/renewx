import { coreFn, getUnsubscribe } from "./utils/core-fn";
import { isStateChanged } from "./utils/is";
import { StoreInnerAPI } from "./api/store-api";
import type { ReadOnlyStore } from "./types/store";
import type { AnyStore } from "./types/any-store";
import type { Adapter, AdapterAction } from "./types/adapter";
import type { AdapterTag } from "./types/tag";
import type { Freeze } from "./types/freeze";
import type { AdapterStoreName } from "./types/name";
import type { Config } from "./types/config";

export const adapter: Adapter = <ToState, Stores extends AnyStore | AnyStore[]>(
  stores: Stores,
  action: AdapterAction,
  storeName: string = "",
  config: Partial<Config> = {},
): ReadOnlyStore<ToState, AdapterTag> => {
  const { skipStateCheck } = config;

  let fromStates = Array.isArray(stores)
    ? stores.map((store) => store.get())
    : stores.get();

  let state = (
    Array.isArray(stores) ? action(...fromStates) : action(fromStates)
  ) as Freeze<ToState>;

  const [id, get, off, name, watch, notify] = coreFn(
    storeName,
    () => state,
    (storeID): AdapterStoreName =>
      `${storeID}:[${
        Array.isArray(stores)
          ? stores.map((store) => store.id).join(",")
          : stores.id
      }]`,
  );

  let isNotifyEnabled = false;

  let unsubscribes = Array.isArray(stores)
    ? stores.map((store, index) =>
        store.watch((storeNewState, info) => {
          if (
            isNotifyEnabled &&
            (skipStateCheck
              ? true
              : isStateChanged(fromStates[index], storeNewState))
          ) {
            fromStates = stores.map((store) => store.get());
            const newState = action(...fromStates) as Freeze<ToState>;
            if (skipStateCheck ? true : isStateChanged(state, newState)) {
              state = newState;

              info &&= {
                id: info.id,
                path: info.path.concat(id),
              };
              notify(state, info);
            }
          }
        }),
      )
    : stores.watch((newFromState, info) => {
        if (isNotifyEnabled) {
          fromStates = newFromState;
          const newState = action(fromStates) as Freeze<ToState>;
          if (skipStateCheck ? true : isStateChanged(state, newState)) {
            state = newState;

            info &&= {
              id: info.id,
              path: info.path.concat(id),
            };
            notify(state, info);
          }
        }
      });

  isNotifyEnabled = true;

  return StoreInnerAPI.add({
    isReadOnly: true,
    tag: "adapter-readOnly",
    id,
    get,
    off: () => {
      isNotifyEnabled = false;
      off();
      Array.isArray(unsubscribes)
        ? unsubscribes.forEach((unsubscribe) => unsubscribe())
        : getUnsubscribe(unsubscribes)();
      unsubscribes = [];
    },
    name,
    watch,
  } as ReadOnlyStore<ToState, AdapterTag>);
};
