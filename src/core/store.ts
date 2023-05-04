import type { InnerStore, Store, StoreOptions } from "../interfaces/store";
import type { ActionID, StoreID, StoreName } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import { nextActionId, nextStoreId } from "../utils/id";
import { getCoreFn } from "../utils/get-core-fn";
import { getValidationFn } from "../utils/get-validation-fn";
import { isNewStateChanged } from "../utils/is";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";

export const store = <State>(
  initState: State,
  options: StoreOptions = {}
): Store<State> => {
  let state = initState as Freeze<State>;
  const storeID: StoreID = nextStoreId();
  const storeName = options.name ?? (`${storeID}` as StoreName);

  const [validation, isValid] = getValidationFn();
  const [id, name, get, watch, notify] = getCoreFn(
    () => storeID,
    () => storeName,
    () => state
  );

  const set: InnerStore<State>["set"] = (newState, info): boolean => {
    console.group(
      `${storeName}.${info?.from.length === 0 ? info.actionID : "#set"} ->`,
      newState
    );

    if (!isNewStateChanged(state, newState) || !isValid(state, newState)) {
      console.info("%c~not changed", "color: #FF5E5B");
      console.groupEnd();
      return false;
    }

    console.info("%c~changed:", "color: #BDFF66", state, "->", newState);
    state = newState as Freeze<State>;
    info === undefined
      ? notify(state)
      : notify(state, {
          actionID: info.actionID,
          from: info.from.concat(storeID),
        });
    console.groupEnd();
    return true;
  };

  console.info(`${storeID} as "${storeName}" created`);

  return StoreInnerAPI.add({
    isReadOnly: false,
    id,
    name,
    get,
    watch,
    isValid,
    validation,
    set,
    action: (action, options) => {
      const _info = StoreInnerAPI.addActionInfo
        ? { actionID: ActionInnerAPI.add(nextActionId(), options), from: [] }
        : undefined;
      return (...args) => set(action(state, ...args), _info);
    },
  } as InnerStore<State>);
};
