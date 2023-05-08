import type {
  AnyStores,
  Store,
  StoresType,
  StoresSet,
  StoresIsValid,
  StoreOptions,
  InnerStore,
} from "../interfaces/store";
import type { Unsubscribe, KeysOfStores } from "../interfaces/core";
import type { ActionFnReturn } from "../interfaces/action";
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
  options: StoreOptions = {}
): Store<R> => {
  const storesNameList = Object.keys(stores) as (string & keyof Stores)[];
  const getStates = () => {
    const states = {} as R;
    storesNameList.forEach(
      (storeName) => (states[storeName] = stores[storeName].get())
    );
    return states as Freeze<R>;
  };
  let states = getStates();

  const [validation, isCurrentStoreValid] = getValidationFn();
  const [id, get, name, watch, notify] = getCoreFn(
    () => states,
    (storeID) =>
      `${storeID}:{${storesNameList
        .map((storeName) => stores[storeName].id)
        .join(",")}}` as JoinStoreName,
    options
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
        from: info.from.concat(id),
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
      (storeName) =>
        storeName in newState &&
        storesIsValid[storeName](oldState[storeName], newState[storeName])
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
      from: info.from.concat(id),
      isSet: true,
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
    action: (action, options) => {
      const info = ActionInnerAPI.addInfo
        ? { id: ActionInnerAPI.add(nextActionId(), options), from: [] }
        : undefined;
      return (...args) => set(action(states, ...args), info);
    },
  } as InnerStore<R>);
};
