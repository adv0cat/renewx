import type { ReadOnlyStore, Store } from "./types/store";
import type { InnerStore } from "./types/inner-store";
import { newValidator } from "./utils/validator";
import { coreFn } from "./utils/core-fn";
import { isStateChanged } from "./utils/is";
import { StoreInnerAPI } from "./api/store-api";
import { ActionInnerAPI } from "./api/action-api";
import type { ActionInfo } from "./types/action";
import type { StoreTag, Tag } from "./types/tag";
import type { Freeze } from "./types/freeze";
import type { StoreName } from "./types/name";
import type { Config } from "./types/config";

export const store = <State>(
  initState: State,
  storeName: string = "",
  config: Partial<Config> = {},
): Store<State> => {
  const { skipStateCheck } = config;

  let state = initState as Freeze<State>;

  const [validator, isValid] = newValidator<State, StoreTag>();
  const [id, get, off, name, watch, notify] = coreFn(
    storeName,
    () => state,
    (id): StoreName => `${id}`,
  );

  let isNotifyEnabled = true;

  const set: InnerStore<State, StoreTag>["set"] = (newState, info): boolean => {
    if (
      !isNotifyEnabled ||
      !(skipStateCheck ? true : isStateChanged(state, newState)) ||
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

  const readOnly = {
    isReadOnly: true,
    tag: "store-readOnly",
    id,
    get,
    off: () => {
      isNotifyEnabled = false;
      off();
    },
    name,
    watch,
  } as ReadOnlyStore<State, Tag<"store">>;

  return StoreInnerAPI.add({
    ...readOnly,
    readOnly: () => readOnly,
    isReadOnly: false,
    tag: "store-writable",
    isValid,
    validator,
    set,
    newAction: (action, name) => {
      const info: ActionInfo | undefined = ActionInnerAPI.addInfo
        ? { id: ActionInnerAPI.add(name), path: [] }
        : undefined;
      return (...args) => set(action(state, ...args), info);
    },
  } as InnerStore<State, StoreTag>);
};
