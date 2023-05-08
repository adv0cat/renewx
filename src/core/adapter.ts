import type {
  StoreOptions,
  ReadOnlyStore,
  AnyStore,
} from "../interfaces/store";
import type { AdapterStoreName } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import type { Adapter, AdapterAction } from "../interfaces/adapter";
import { StoreInnerAPI } from "./store-api";
import { getCoreFn } from "../utils/get-core-fn";
import { isNewStateChanged } from "../utils/is";

export const adapter: Adapter = <ToState, Stores extends AnyStore | AnyStore[]>(
  stores: Stores,
  adapterAction: AdapterAction<ToState, Stores>,
  options: StoreOptions = {}
): ReadOnlyStore<ToState> => {
  let fromStates = Array.isArray(stores)
    ? stores.map((store) => store.get())
    : stores.get();

  let state = (
    Array.isArray(stores)
      ? (adapterAction as AdapterAction<ToState>)(...fromStates)
      : adapterAction(fromStates)
  ) as Freeze<ToState>;

  const [id, get, name, watch, notify] = getCoreFn(
    () => state,
    (storeID) =>
      `${storeID}:[${
        Array.isArray(stores)
          ? stores.map((store) => store.id).join(",")
          : stores.id
      }]` as AdapterStoreName,
    options
  );

  let isNotifyEnabled = false;

  const unsubscribes = Array.isArray(stores)
    ? stores.map((store, index) =>
        store.watch((storeNewState, info) => {
          if (!isNotifyEnabled) {
            return;
          }

          if (!isNewStateChanged(fromStates[index], storeNewState)) {
            return;
          }

          info &&= {
            id: info.id,
            from: info.from.concat(id),
          };

          fromStates = stores.map((store) => store.get());
          state = (adapterAction as AdapterAction<ToState>)(
            ...fromStates
          ) as Freeze<ToState>;
          notify(state, info);
        })
      )
    : stores.watch((newFromState, info) => {
        if (!isNotifyEnabled) {
          return;
        }

        info &&= {
          id: info.id,
          from: info.from.concat(id),
        };

        fromStates = newFromState;
        state = adapterAction(fromStates) as Freeze<ToState>;
        notify(state, info);
      });

  isNotifyEnabled = true;

  return StoreInnerAPI.add({
    isReadOnly: true,
    id,
    get,
    name,
    watch,
  } as ReadOnlyStore<ToState>);
};
