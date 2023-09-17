import { newValidator } from "./utils/validator";
import { coreFn } from "./utils/core-fn";
import { isStateChanged } from "./utils/is";
import { StoreInnerAPI } from "./api/store-api";
import { ActionInnerAPI } from "./api/action-api";
import type { ReadOnlyStore } from "./types/store";
import {
  type InnerStore,
  isInnerStore,
  type KeysOfInnerStores,
} from "./types/inner-store";
import type { AnyStore } from "./types/any-store";
import type { ActionInfo } from "./types/action";
import type { JoinTag, Tag, WritableTag } from "./types/tag";
import type { ActionFnJoinReturn, JoinState, JoinStore } from "./types/join";
import type { Freeze } from "./types/freeze";
import type { JoinStoreName } from "./types/name";
import type { Config } from "./types/config";

export const join = <Stores extends Record<string, AnyStore>>(
  stores: Stores,
  storeName: string = "",
  config: Partial<Config> = {},
): JoinStore<Stores> => {
  const { skipStateCheck } = config;

  const nameList = Object.keys(stores) as (string & keyof Stores)[];
  const innerStoreMap = new Map<
    KeysOfInnerStores<Stores>,
    InnerStore<any, WritableTag>
  >();
  nameList.forEach((name) => {
    const store = stores[name];
    if (isInnerStore(store)) {
      innerStoreMap.set(name as KeysOfInnerStores<Stores>, store);
    }
  });

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
  const isChildrenValid: InnerStore<JoinState<Stores>, JoinTag>["isValid"] = (
    oldState,
    newState: ActionFnJoinReturn<Stores> | Freeze<JoinState<Stores>>,
  ) => {
    if (newState == null) {
      return true;
    }
    for (const [name, store] of innerStoreMap) {
      if (name in newState && !store.isValid(oldState[name], newState[name])) {
        return false;
      }
    }
    return true;
  };
  const isValid: InnerStore<JoinState<Stores>, JoinTag>["isValid"] = (
    oldState,
    newState,
  ) =>
    isChildrenValid(oldState, newState) &&
    isCurrentStoreValid(oldState, newState);

  const [id, get, off, name, watch, notify] = coreFn(
    storeName,
    () => states,
    (storeID): JoinStoreName => `${storeID}:{${nameList.join(",")}}`,
  );

  let isNotifyEnabled = false;

  let unsubscribes = nameList.map((name) =>
    stores[name].watch((state, info) => {
      if (isNotifyEnabled) {
        const newStates = getStates();
        if (
          (skipStateCheck ? true : isStateChanged(states, newStates)) &&
          isChildrenValid(states, newStates)
        ) {
          info &&= {
            id: info.id,
            path: info.path.concat(id),
          };

          states = newStates;
          notify(states, info);
        }
      }
    }),
  );

  const set: InnerStore<JoinState<Stores>, JoinTag>["set"] = (
    actionStates,
    info,
  ): boolean => {
    if (
      !isNotifyEnabled ||
      actionStates == null ||
      !(skipStateCheck ? true : isStateChanged(states, actionStates)) ||
      !isValid(states, actionStates)
    ) {
      return false;
    }

    info &&= {
      id: info.id,
      path: info.path.concat(id),
      set: true,
    };

    isNotifyEnabled = false;
    let isChanged = false;
    for (const [name, store] of innerStoreMap) {
      if (name in actionStates && store.set(actionStates[name], info)) {
        isChanged = true;
      }
    }
    isNotifyEnabled = true;

    if (isChanged) {
      states = getStates();
      notify(states, info);
      return true;
    }

    return false;
  };

  isNotifyEnabled = true;

  const readOnly = {
    isReadOnly: true,
    tag: "join-readOnly",
    id,
    get,
    off: () => {
      isNotifyEnabled = false;
      off();
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      unsubscribes = [];
    },
    name,
    watch,
  } as ReadOnlyStore<JoinState<Stores>, Tag<"join">>;

  return StoreInnerAPI.add({
    ...readOnly,
    readOnly: () => readOnly,
    isReadOnly: false,
    tag: "join-writable",
    isValid,
    validator,
    set,
    newAction: (action, name) => {
      const info: ActionInfo | undefined = ActionInnerAPI.addInfo
        ? { id: ActionInnerAPI.add(name), path: [] }
        : undefined;
      return (...args) => set(action(states, ...args), info);
    },
  } as InnerStore<JoinState<Stores>, JoinTag>);
};
