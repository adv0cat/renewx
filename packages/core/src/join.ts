import { newValidator } from "./utils/validator";
import { isStateChanged } from "./utils/is";
import { saveStore } from "./api/store-api";
import {
  type InnerStore,
  isInnerStore,
  type KeysOfInnerStores,
} from "./types/inner-store";
import type { AnyStore } from "./types/any-store";
import type { JoinTag, WritableTag } from "./types/tag";
import type { JoinState, JoinStore } from "./types/join";
import type { Freeze } from "./types/freeze";
import type { JoinStoreName } from "./types/name";
import type { Config } from "./types/config";
import type { ActionInfo } from "./types/action";
import { readOnlyStore } from "./read-only-store";
import { getNotify } from "./api/queue-api";
import { newActionInfo } from "./api/action-api";
import { configMerge } from "./types/config";
import { watch } from "./fn/watch";

export const join = <Stores extends Record<string, AnyStore>>(
  stores: Stores,
  storeName: string = "",
  config: Partial<Config> = {},
): JoinStore<Stores> => {
  const mergedConfig = configMerge(config);
  const { optimizeStateChange } = mergedConfig;

  const nameList = Object.keys(stores) as (string & keyof Stores)[];
  const storeList = nameList.map((name) => stores[name]);
  const innerStoreMap = new Map<
    KeysOfInnerStores<Stores>,
    InnerStore<any, WritableTag>
  >();
  storeList.forEach((store, index) =>
    isInnerStore(store)
      ? innerStoreMap.set(nameList[index] as KeysOfInnerStores<Stores>, store)
      : void 0,
  );

  const getStates = () => {
    const states = {} as JoinState<Stores>;
    nameList.forEach((name) => (states[name] = stores[name].get()));
    return states as Freeze<JoinState<Stores>>;
  };
  let states = getStates();

  const [validator, isCurrentStoreValid] = newValidator<
    JoinState<Stores>,
    JoinTag
  >();
  const isValid: InnerStore<JoinState<Stores>, JoinTag>["isValid"] = (
    oldState,
    newState,
  ) => {
    for (const [name, store] of innerStoreMap) {
      if (!store.isValid(oldState[name], newState[name])) {
        return false;
      }
    }
    return isCurrentStoreValid(oldState, newState);
  };

  let isNotifyEnabled = false;
  const readOnly = readOnlyStore(
    storeName,
    "join-readOnly",
    () => states,
    (storeID): JoinStoreName => `${storeID}:{${nameList.join(",")}}`,
    () => {
      isNotifyEnabled = false;
      unsubscribe();
    },
  );
  const notify = getNotify(readOnly);

  const unsubscribe = watch(
    storeList,
    (_, info) => {
      const newStates = getStates();
      if (isValid(states, newStates)) {
        notify((states = newStates), info);
      }
    },
    mergedConfig,
  );

  const set: InnerStore<JoinState<Stores>, JoinTag>["set"] = (
    partialNewStates,
    info,
  ): boolean => {
    if (!isNotifyEnabled || partialNewStates == null) {
      return false;
    }

    const newStates: Freeze<JoinState<Stores>> = Object.assign({}, states);
    for (const key in partialNewStates) {
      if (key in newStates) {
        newStates[key] = (partialNewStates as any)[key];
      }
    }
    if (
      !(!optimizeStateChange || isStateChanged(states, newStates)) ||
      !isValid(states, newStates)
    ) {
      return false;
    }

    const storeInfo: ActionInfo | undefined = info && {
      id: info.id,
      path: info.path.concat(readOnly.id),
    };
    isNotifyEnabled = false;
    for (const [name, store] of innerStoreMap) {
      if (name in partialNewStates) {
        store.set(partialNewStates[name], storeInfo);
      }
    }
    isNotifyEnabled = true;

    notify((states = getStates()), info, true);
    return true;
  };

  isNotifyEnabled = true;

  return saveStore({
    ...readOnly,
    readOnly: () => readOnly,
    isReadOnly: false,
    tag: "join-writable",
    isValid,
    validator,
    set,
    newAction: (action, name) => {
      const info = newActionInfo(name);
      return (...args) => set(action(states, ...args), info);
    },
  } as InnerStore<JoinState<Stores>, JoinTag>);
};
