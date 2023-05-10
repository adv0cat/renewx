import type {
  AnyStores,
  Store,
  StoresType,
  InnerStore,
} from "../interfaces/store";
import type { KeysOfStores } from "../interfaces/core";
import type { ActionFnReturn, ActionInfo } from "../interfaces/action";
import type { JoinStoreName } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";
import { nextActionId } from "../utils/id";
import { getCoreFn } from "../utils/get-core-fn";
import { isStateChanged, isInnerStore } from "../utils/is";
import { getValidationFn } from "../utils/get-validation-fn";

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

  const [validation, isCurrentStoreValid] = getValidationFn();
  const [id, get, off, name, watch, notify] = getCoreFn(
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
    action: (action, name) => {
      const info: ActionInfo | undefined = ActionInnerAPI.addInfo
        ? { id: ActionInnerAPI.add(nextActionId(), name), path: [] }
        : undefined;
      return (...args) => set(action(states, ...args), info);
    },
  } as InnerStore<R>);
};
