import type { Store, StoreOptions, ReadOnlyStore } from "../interfaces/store";
import type { AdapterAction } from "../interfaces/action";
import type { AdapterStoreID } from "../interfaces/id";
import { nextStoreId } from "../utils/id";
import { freeze } from "../utils/freeze";
import { getCoreFn } from "../utils/get-core-fn";

export const adapter = <FromState, ToState>(
  store: Store<FromState> | ReadOnlyStore<FromState>,
  adapterAction: AdapterAction<FromState, ToState>,
  { name }: StoreOptions = {}
): ReadOnlyStore<ToState> => {
  let fromState = store.get();
  let state = freeze(adapterAction(fromState));
  const storeID: AdapterStoreID = `(${store.id()}=>${nextStoreId(name)})`;

  const [get, id, watch, notify] = getCoreFn(
    () => state,
    () => storeID
  );

  console.info(`${storeID} created`);

  const unsubscribe = store.watch((_fromState, info) => {
    fromState = _fromState;
    state = freeze(adapterAction(fromState));
    notify(state, info);
  });

  return {
    isReadOnly: true,
    id,
    get,
    watch,
  } as ReadOnlyStore<ToState>;
};
