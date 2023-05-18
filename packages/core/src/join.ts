import {
  type AnyStores,
  type InnerStore,
  isInnerStore,
  type Store,
  type StoresType,
} from "./utils/store";
import type { KeysOfStores } from "./utils/core";
import type { Freeze } from "./utils/freeze";
import type { ActionFnReturn, ActionInfo } from "./utils/action";
import type { JoinStoreName } from "./utils/name";
import { validationFn } from "./utils/validation-fn";
import { coreFn } from "./utils/core-fn";
import { isStateChanged } from "./utils/is";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";

export const join = <Stores extends AnyStores, R extends StoresType<Stores>>(
  stores: Stores,
  storeName: string = ""
): Store<R> => {
  const nameList = Object.keys(stores) as (string & keyof Stores)[];
  const innerStoreMap = new Map<KeysOfStores<Stores>, InnerStore<any>>();
  nameList.forEach((name) => {
    const store = stores[name];
    if (isInnerStore(store)) {
      innerStoreMap.set(name as KeysOfStores<Stores>, store);
    }
  });

  const getStates = () => {
    const states = {} as R;
    nameList.forEach((name) => (states[name] = stores[name].get()));
    return states as Freeze<R>;
  };
  let states = getStates();

  const [validation, isCurrentStoreValid] = validationFn();
  const isChildrenValid: Store<R>["isValid"] = (oldState, newState) => {
    for (const [name, store] of innerStoreMap) {
      if (name in newState && !store.isValid(oldState[name], newState[name])) {
        return false;
      }
    }
    return true;
  };
  const isValid: Store<R>["isValid"] = (oldState, newState) =>
    isChildrenValid(oldState, newState) &&
    isCurrentStoreValid(oldState, newState);

  const [id, get, off, name, watch, notify] = coreFn(
    storeName,
    () => states,
    (storeID): JoinStoreName => `${storeID}:{${nameList.join(",")}}`
  );

  let isNotifyEnabled = false;

  let unsubscribes = nameList.map((name) =>
    stores[name].watch((state, info) => {
      if (isNotifyEnabled) {
        const newStates = getStates();
        if (
          isStateChanged(states, newStates) &&
          isChildrenValid(states, newStates as ActionFnReturn<R>)
        ) {
          info &&= {
            id: info.id,
            path: info.path.concat(id),
          };

          states = newStates;
          notify(states, info);
        }
      }
    })
  );

  const set: InnerStore<R>["set"] = (actionStates, info): boolean => {
    if (
      !isNotifyEnabled ||
      actionStates == null ||
      !isStateChanged(states, actionStates) ||
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

  return StoreInnerAPI.add({
    isReadOnly: false,
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
    isValid,
    validation,
    set,
    updater: (action, name) => {
      const info: ActionInfo | undefined = ActionInnerAPI.addInfo
        ? { id: ActionInnerAPI.add(name), path: [] }
        : undefined;
      return (...args) => set(action(states, ...args), info);
    },
  } as InnerStore<R>);
};
