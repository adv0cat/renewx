import type {
  StoreOptions,
  ReadOnlyStore,
  AnyStore,
} from "../interfaces/store";
import type { AdapterStoreName, StoreID } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import type { Adapter, AdapterAction } from "../interfaces/adapter";
import { nextStoreId } from "../utils/id";
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

  const storeID: StoreID = nextStoreId();
  const storeName =
    options.name ??
    (`${storeID}:[${
      Array.isArray(stores)
        ? stores.map((store) => store.id()).join(",")
        : stores.id()
    }]` as AdapterStoreName);

  const [id, name, get, watch, notify] = getCoreFn(
    () => storeID,
    () => storeName,
    () => state
  );

  console.info(`${storeID} as "${storeName}" created`);

  let isNotifyEnabled = false;

  const unsubscribes = Array.isArray(stores)
    ? stores.map((store, index) =>
        store.watch((storeNewState, { actionID, from }) => {
          if (!isNotifyEnabled) {
            return;
          }

          console.group(`${storeName}.#up(${JSON.stringify(storeNewState)})`);

          if (!isNewStateChanged(fromStates[index], storeNewState)) {
            console.info("%c~not changed", "color: #FF5E5B");
            console.groupEnd();
            return;
          }

          fromStates = stores.map((store) => store.get());
          const newState = (adapterAction as AdapterAction<ToState>)(
            ...fromStates
          );
          console.info("%c~changed:", "color: #BDFF66", state, "->", newState);
          state = newState as Freeze<ToState>;
          notify(state, { actionID, from: from.concat(storeID) });
          console.groupEnd();
        })
      )
    : stores.watch((newFromState, { actionID, from }) => {
        if (!isNotifyEnabled) {
          return;
        }

        console.group(`${storeName}.#up(${JSON.stringify(newFromState)})`);

        fromStates = newFromState;
        const newState = adapterAction(fromStates);
        console.info("%c~changed:", "color: #BDFF66", state, "->", newState);
        state = newState as Freeze<ToState>;
        notify(state, { actionID, from: from.concat(storeID) });
        console.groupEnd();
      });

  isNotifyEnabled = true;

  return {
    isReadOnly: true,
    id,
    name,
    get,
    watch,
  } as ReadOnlyStore<ToState>;
};
