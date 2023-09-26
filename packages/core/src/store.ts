import type { Store } from "./types/store";
import { isStateChanged } from "./utils/is";
import { saveStore } from "./api/store-api";
import type { StoreTag } from "./types/tag";
import type { Freeze } from "./types/freeze";
import type { StoreName } from "./types/name";
import type { Config } from "./types/config";
import { mergeConfig } from "./utils/merge-config";
import { readOnlyStore } from "./read-only-store";
import { getNotify } from "./api/queue-api";
import { newActionInfo } from "./api/action-api";
import { actionStore } from "./action-store";
import type { ActionStore } from "./types/action-store";

export const store = <State>(
  initState: State,
  storeName: string = "",
  config: Partial<Config> = {},
): Store<State> => {
  const { stateCheck } = mergeConfig(config);

  let state = initState as Freeze<State>;

  let isNotifyEnabled = true;
  const _readOnlyStore = readOnlyStore(
    () => state,
    "rs",
    () => (isNotifyEnabled = false),
    storeName,
    (storeID): StoreName => `${storeID}`,
  );

  const _actionStore = actionStore<State, StoreTag>(_readOnlyStore);
  const notify = getNotify<State>(_actionStore.id);
  const setInfo = newActionInfo("set");
  const set: ActionStore<State, StoreTag>["set"] = (
    newState: Freeze<State>,
    info = setInfo,
  ) =>
    !isNotifyEnabled ||
    !(!stateCheck || isStateChanged(state, newState)) ||
    !_actionStore.isValid(state, newState)
      ? false
      : notify((state = newState), info, true);

  return saveStore({
    ..._actionStore,
    set,
    newAction: (action, name) => {
      const info = newActionInfo(name);
      return (...args) => set(action(state, ...args), info);
    },
  });
};
