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
    console.group(
      `${name()}.${info?.from.length === 0 ? info.actionID : "#set"} ->`,
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
          from: info.from.concat(id),
        });
    console.groupEnd();
    return true;
  };

  console.info(`${name()} created`);

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
      const _info = StoreInnerAPI.addActionInfo
        ? { actionID: ActionInnerAPI.add(nextActionId(), options), from: [] }
        : undefined;
      return (...args) => set(action(state, ...args), _info);
    },
  } as InnerStore<State>);
};
