import type { Store } from "./types/store";
import type { InnerStore } from "./types/inner-store";
import { newValidator } from "./utils/validator";
import { isStateChanged } from "./utils/is";
import { saveStore } from "./api/store-api";
import type { StoreTag } from "./types/tag";
import type { Freeze } from "./types/freeze";
import type { StoreName } from "./types/name";
import type { Config } from "./types/config";
import { configMerge } from "./types/config";
import { readOnlyStore } from "./read-only-store";
import { getNotify } from "./api/queue-api";
import { newActionInfo } from "./api/action-api";

export const store = <State>(
  initState: State,
  storeName: string = "",
  config: Partial<Config> = {},
): Store<State> => {
  const { optimizeStateChange } = configMerge(config);

  let state = initState as Freeze<State>;

  const [validator, isValid] = newValidator<State, StoreTag>();

  let isNotifyEnabled = true;
  const readOnly = readOnlyStore(
    storeName,
    "store-readOnly",
    () => state,
    (storeID): StoreName => `${storeID}`,
    () => {
      isNotifyEnabled = false;
    },
  );
  const notify = getNotify(readOnly);

  const set: InnerStore<State, StoreTag>["set"] = (
    newState: Freeze<State>,
    info,
  ): boolean => {
    if (
      !isNotifyEnabled ||
      !(!optimizeStateChange || isStateChanged(state, newState)) ||
      !isValid(state, newState)
    ) {
      return false;
    }

    notify((state = newState), info, true);
    return true;
  };

  return saveStore({
    ...readOnly,
    readOnly: () => readOnly,
    isReadOnly: false,
    tag: "store-writable",
    isValid,
    validator,
    set,
    newAction: (action, name) => {
      const info = newActionInfo(name);
      return (...args) => set(action(state, ...args), info);
    },
  } as InnerStore<State, StoreTag>);
};
