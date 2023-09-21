import { isStateChanged } from "./utils/is";
import type { AnyStore } from "./types/any-store";
import type { Adapter, AdapterAction } from "./types/adapter";
import type { AdapterTag } from "./types/tag";
import type { Freeze } from "./types/freeze";
import type { AdapterStoreName } from "./types/name";
import type { Config } from "./types/config";
import type { ReadOnlyStore } from "./types/read-only-store";
import { readOnlyStore } from "./read-only-store";
import { getNotify } from "./api/queue-api";
import { saveStore } from "./api/store-api";
import { configMerge } from "./types/config";

export const adapter: Adapter = <ToState, Stores extends AnyStore | AnyStore[]>(
  stores: Stores,
  action: AdapterAction,
  storeName: string = "",
  config: Partial<Config> = {},
): ReadOnlyStore<ToState, AdapterTag> => {
  const { optimizeStateChange } = configMerge(config);

  let fromStates = Array.isArray(stores)
    ? stores.map((store) => store.get())
    : stores.get();

  let state = (
    Array.isArray(stores) ? action(...fromStates) : action(fromStates)
  ) as Freeze<ToState>;

  let isNotifyEnabled = false;
  const readOnly = readOnlyStore(
    storeName,
    "adapter-readOnly",
    () => state,
    (storeID): AdapterStoreName =>
      `${storeID}:[${
        Array.isArray(stores) ? stores.map(({ id }) => id).join(",") : stores.id
      }]`,
    () => {
      isNotifyEnabled = false;
      (Array.isArray(unsubscribes) ? unsubscribes : [unsubscribes]).forEach(
        (unsubscribe) => unsubscribe(),
      );
      unsubscribes = [];
    },
  );
  const notify = getNotify(readOnly);

  let unsubscribes = Array.isArray(stores)
    ? stores.map((store, index) =>
        store.watch((storeNewState, info) => {
          if (
            isNotifyEnabled &&
            (!optimizeStateChange ||
              isStateChanged(fromStates[index], storeNewState))
          ) {
            fromStates = stores.map((store) => store.get());
            const newState = action(...fromStates) as Freeze<ToState>;
            if (!optimizeStateChange || isStateChanged(state, newState)) {
              notify((state = newState), info);
            }
          }
        }),
      )
    : stores.watch((newFromState, info) => {
        if (
          isNotifyEnabled &&
          (!optimizeStateChange || isStateChanged(fromStates, newFromState))
        ) {
          fromStates = newFromState;
          const newState = action(fromStates) as Freeze<ToState>;
          if (!optimizeStateChange || isStateChanged(state, newState)) {
            notify((state = newState), info);
          }
        }
      });

  isNotifyEnabled = true;

  return saveStore(readOnly);
};
