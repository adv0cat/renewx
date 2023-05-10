import type { InnerStore, Store } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { StoreName } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import { nextActionId } from "../utils/id";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";
import { getCoreFn } from "../utils/get-core-fn";
import { getValidationFn } from "../utils/get-validation-fn";
import { isStateChanged } from "../utils/is";

export const store = <State>(
  initState: State,
  storeName: string = ""
): Store<State> => {
  let state = initState as Freeze<State>;

  const [validation, isValid] = getValidationFn();
  const [id, get, off, name, watch, notify] = getCoreFn(
    storeName,
    () => state,
    (id): StoreName => `${id}`
  );

  let isNotifyEnabled = true;

  const set: InnerStore<State>["set"] = (newState, info): boolean => {
    if (
      !isNotifyEnabled ||
      !isStateChanged(state, newState) ||
      !isValid(state, newState)
    ) {
      return false;
    }

    info &&= {
      id: info.id,
      path: info.path.concat(id),
      set: true,
    };

    state = newState as Freeze<State>;
    notify(state, info);
    return true;
  };

  return StoreInnerAPI.add({
    isReadOnly: false,
    id,
    get,
    off: () => {
      isNotifyEnabled = false;
      off();
    },
    name,
    watch,
    isValid,
    validation,
    set,
    updater: (action, name) => {
      const info: ActionInfo | undefined = ActionInnerAPI.addInfo
        ? { id: ActionInnerAPI.add(nextActionId(), name), path: [] }
        : undefined;
      return (...args) => set(action(state, ...args), info);
    },
  } as InnerStore<State>);
};
