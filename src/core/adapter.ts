import type {
  StoreOptions,
  ReadOnlyStore,
  AnyStore,
} from "../interfaces/store";
import type { AdapterStoreID } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import type { Adapter, AdapterAction } from "../interfaces/adapter";
import { nextStoreId } from "../utils/id";
import { getCoreFn } from "../utils/get-core-fn";
import { isNewStateChanged } from "../utils/is";

export const adapter: Adapter = <ToState, Stores extends AnyStore | AnyStore[]>(
  stores: Stores,
  adapterAction: AdapterAction<ToState, Stores>,
  { name }: StoreOptions = {}
): ReadOnlyStore<ToState> => {
  let fromStates = Array.isArray(stores)
    ? stores.map((store) => store.get())
    : stores.get();

  let state = (
    Array.isArray(stores)
      ? (adapterAction as AdapterAction<ToState>)(...fromStates)
      : adapterAction(fromStates)
  ) as Freeze<ToState>;

  const storeID: AdapterStoreID = `(${
    Array.isArray(stores)
      ? stores.map((store) => store.id()).join(";")
      : stores.id()
  }>${nextStoreId(name)})`;

  const [get, id, watch, notify] = getCoreFn(
    () => state,
    () => storeID
  );

  console.info(`${storeID} created`);

  let isNotifyEnabled = false;

  const unsubscribes = Array.isArray(stores)
    ? stores.map((store, index) =>
        store.watch((storeNewState, info) => {
          if (!isNotifyEnabled) {
            return;
          }

          console.group(
            `${storeID}.${store.id()}.#set(${JSON.stringify(storeNewState)})`
          );

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
          notify(state, info);
          console.groupEnd();
        })
      )
    : stores.watch((newFromState, info) => {
        if (!isNotifyEnabled) {
          return;
        }

        console.group(`${storeID}.#set(${JSON.stringify(newFromState)})`);
        fromStates = newFromState;
        // const newState = freeze(adapterAction(fromStates));
        const newState = adapterAction(fromStates);
        console.info("%c~changed:", "color: #BDFF66", state, "->", newState);
        state = newState as Freeze<ToState>;
        notify(state, info);
        console.groupEnd();
      });

  isNotifyEnabled = true;

  return {
    isReadOnly: true,
    id,
    get,
    watch,
  } as ReadOnlyStore<ToState>;
};
