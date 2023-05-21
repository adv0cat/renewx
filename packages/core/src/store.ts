import type { InnerStore, Store } from "./utils/store";
import type { Freeze } from "./utils/freeze";
import type { ActionInfo } from "./utils/action";
import type { StoreName } from "./utils/name";
import { newValidator } from "./utils/validator";
import { coreFn } from "./utils/core-fn";
import { isStateChanged } from "./utils/is";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";

export const store = <State>(
  initState: State,
  storeName: string = ""
): Store<State> => {
  let state = initState as Freeze<State>;

  const [validator, isValid] = newValidator();
  const [id, get, off, name, watch, notify] = coreFn(
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
    validator,
    set,
    newAction: (action, name) => {
      const info: ActionInfo | undefined = ActionInnerAPI.addInfo
        ? { id: ActionInnerAPI.add(name), path: [] }
        : undefined;
      return (...args) => set(action(state, ...args), info);
    },
  } as InnerStore<State>);
};
