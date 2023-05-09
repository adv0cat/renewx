import type {
  AnyStores,
  Store,
  StoresType,
  StoresSet,
  StoresIsValid,
  InnerStore,
} from "../interfaces/store";
import type { Unsubscribe, KeysOfStores } from "../interfaces/core";
import type { ActionFnReturn, ActionInfo } from "../interfaces/action";
import type { JoinStoreName } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";
import { nextActionId } from "../utils/id";
import { getCoreFn } from "../utils/get-core-fn";
import { isNewStateChanged, isInnerStore } from "../utils/is";
import { getValidationFn } from "../utils/get-validation-fn";

export const join = <Stores extends AnyStores, R extends StoresType<Stores>>(
  stores: Stores,
  storeName: string = ""
): Store<R> => {
  const storesNameList = Object.keys(stores) as (string & keyof Stores)[];
  const getStates = () => {
    const states = {} as R;
    storesNameList.forEach((name) => (states[name] = stores[name].get()));
    return states as Freeze<R>;
  };
  let states = getStates();

  const [validation, isCurrentStoreValid] = getValidationFn();
  const [id, get, name, watch, notify] = getCoreFn(
    storeName,
    () => states,
    (storeID): JoinStoreName =>
      `${storeID}:{${storesNameList.map((name) => stores[name].id).join(",")}}`
  );

  let isNotifyEnabled = false;

  const unsubscribes = {} as Record<string, Unsubscribe>;
  const storesSet = {} as StoresSet<Stores>;
  const storesIsValid = {} as StoresIsValid<Stores>;

  for (const _storeName of storesNameList) {
    const store = stores[_storeName];

    unsubscribes[_storeName] = store.watch((state, info) => {
      if (!isNotifyEnabled) {
        return;
      }

      const newStates = getStates();
      if (
        !isNewStateChanged(states, newStates) ||
        !isChildrenValid(states, newStates as ActionFnReturn<R>)
      ) {
        return;
      }

      info &&= {
        id: info.id,
        path: info.path.concat(id),
      };

      states = newStates;
      notify(states, info);
    });

    if (isInnerStore(store)) {
      storesSet[_storeName as KeysOfStores<Stores>] = store.set;
      storesIsValid[_storeName as KeysOfStores<Stores>] = store.isValid;
    }
  }
  const isValidNameList = Object.keys(storesIsValid) as KeysOfStores<Stores>[];

  const isChildrenValid: Store<R>["isValid"] = (oldState, newState) =>
    isValidNameList.every(
      (name) =>
        name in newState && storesIsValid[name](oldState[name], newState[name])
    );
  const isValid: Store<R>["isValid"] = (oldState, newState) =>
    isChildrenValid(oldState, newState) &&
    isCurrentStoreValid(oldState, newState);

  const set: InnerStore<R>["set"] = (actionStates, info): boolean => {
    if (
      actionStates == null ||
      !isNewStateChanged(states, actionStates) ||
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
    for (const actionState of Object.keys(actionStates)) {
      if (
        storesSet[actionState as KeysOfStores<Stores>]?.(
          actionStates[actionState],
          info
        )
      ) {
        isChanged = true;
      }
    }
    isNotifyEnabled = true;

    if (!isChanged) {
      return false;
    }

    states = getStates();
    notify(states, info);
    return true;
  };

  isNotifyEnabled = true;

  return StoreInnerAPI.add({
    isReadOnly: false,
    id,
    get,
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
