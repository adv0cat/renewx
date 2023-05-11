import type { ReadOnlyStore, AnyStore } from "../interfaces/store";
import type { AdapterStoreName } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import type { Adapter, AdapterAction } from "../interfaces/adapter";
import { StoreInnerAPI } from "../api/store-api";
import { getCoreFn, getUnsubscribe } from "../utils/get-core-fn";
import { isStateChanged } from "../utils/is";

export const adapter: Adapter = <ToState, Stores extends AnyStore | AnyStore[]>(
  stores: Stores,
  adapterAction: AdapterAction<ToState, Stores>,
  storeName: string = ""
): ReadOnlyStore<ToState> => {
  let fromStates = Array.isArray(stores)
    ? stores.map((store) => store.get())
    : stores.get();

  let state = (
    Array.isArray(stores)
      ? (adapterAction as AdapterAction<ToState>)(...fromStates)
      : adapterAction(fromStates)
  ) as Freeze<ToState>;

  const [id, get, off, name, watch, notify] = getCoreFn(
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
            isStateChanged(fromStates[index], storeNewState)
          ) {
            info &&= {
              id: info.id,
              path: info.path.concat(id),
            };

            fromStates = stores.map((store) => store.get());
            state = (adapterAction as AdapterAction<ToState>)(
              ...fromStates
            ) as Freeze<ToState>;
            notify(state, info);
          }
        })
      )
    : stores.watch((newFromState, info) => {
        if (isNotifyEnabled) {
          info &&= {
            id: info.id,
            path: info.path.concat(id),
          };

          fromStates = newFromState;
          state = adapterAction(fromStates) as Freeze<ToState>;
          notify(state, info);
        }
      });

  isNotifyEnabled = true;

  return StoreInnerAPI.add({
    isReadOnly: true,
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
  } as ReadOnlyStore<ToState>);
};
