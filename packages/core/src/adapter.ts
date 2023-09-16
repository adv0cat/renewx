import type { Adapter, AdapterAction } from "./utils/adapter";
import type { AnyStore, ReadOnlyStore } from "./utils/store";
import type { Freeze } from "./utils/freeze";
import type { AdapterStoreName } from "./utils/name";
import type { AdapterTag } from "./utils/tag";
import { type Config, toConfig } from "./utils/config";
import { coreFn, getUnsubscribe } from "./utils/core-fn";
import { isStateChanged } from "./utils/is";
import { StoreInnerAPI } from "./store-api";

export const adapter: Adapter = <ToState, Stores extends AnyStore | AnyStore[]>(
  stores: Stores,
  action: AdapterAction,
  storeName: string = "",
  config: Partial<Config> = {},
): ReadOnlyStore<ToState, AdapterTag> => {
  const { skipStateCheck } = toConfig(config);

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
      }]`
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
        })
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
