import type { InnerStore, Store, StoreOptions } from "../interfaces/store";
import type { StoreName } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import { nextActionId } from "../utils/id";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";
import { getCoreFn } from "../utils/get-core-fn";
import { getValidationFn } from "../utils/get-validation-fn";
import { isNewStateChanged } from "../utils/is";

export const store = <State>(
  initState: State,
  options: StoreOptions = {}
): Store<State> => {
  let state = initState as Freeze<State>;

  const [validation, isValid] = getValidationFn();
  const [id, get, name, watch, notify] = getCoreFn(
    () => state,
    (id) => `${id}` as StoreName,
    options
  );

  const set: InnerStore<State>["set"] = (newState, info): boolean => {
    if (!isNewStateChanged(state, newState) || !isValid(state, newState)) {
      return false;
    }

    info &&= {
      id: info.id,
      from: info.from.concat(id),
      isSet: true,
    };

    state = newState as Freeze<State>;
    notify(state, info);
    return true;
  };

  return StoreInnerAPI.add({
    isReadOnly: false,
    id,
    get,
    name,
    watch,
    isValid,
    validation,
    set,
    action: (action, options) => {
      const info = ActionInnerAPI.addInfo
        ? { id: ActionInnerAPI.add(nextActionId(), options), from: [] }
        : undefined;
      return (...args) => set(action(state, ...args), info);
    },
  } as InnerStore<State>);
};
