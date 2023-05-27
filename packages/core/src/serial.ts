import type { Serial, SerialStore } from "./utils/serial";
import type { StoreName } from "./utils/name";
import type { ActionInfo } from "./utils/action";
import type { Freeze } from "./utils/freeze";
import type { InnerStore } from "./utils/store";
import type { SerialMark } from "./utils/mark";
import { newValidator } from "./utils/validator";
import { coreFn } from "./utils/core-fn";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";

export const serial = <State>(
  initState: State,
  storeName: string = ""
): SerialStore<State> => {
  let state = {
    order: 0,
    state: initState,
  } as Freeze<Serial<State>>;

  const [validator, isValid] = newValidator<Serial<State>, SerialMark>();
  const [id, get, off, name, watch, notify] = coreFn<Serial<State>>(
    storeName,
    () => state,
    (id): StoreName => `${id}`
  );

  let isNotifyEnabled = true;

  const set: InnerStore<Serial<State>, SerialMark>["set"] = (
    newState,
    info
  ): boolean => {
    if (!isNotifyEnabled || !isValid(state, newState)) {
      return false;
    }

    info &&= {
      id: info.id,
      path: info.path.concat(id),
      set: true,
    };

    state = {
      order: state.order + 1,
      state: newState,
    } as Freeze<Serial<State>>;
    notify(state, info);
    return true;
  };

  return StoreInnerAPI.add({
    isReadOnly: false,
    mark: "serial-writable",
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
  } as InnerStore<Serial<State>, SerialMark>);
};
