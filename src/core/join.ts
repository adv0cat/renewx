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
import type { ActionFnReturn, ActionInfo } from "../interfaces/action";
import type { ActionID, JoinStoreName, StoreID } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import { nextActionId, nextStoreId } from "../utils/id";
import { getCoreFn } from "../utils/get-core-fn";
import {
  isNotReadOnlyStore,
  isNewStateChanged,
  isInnerStore,
} from "../utils/is";
import { getValidationFn } from "../utils/get-validation-fn";
import { StoreInnerAPI } from "./store-api";
import { ActionInnerAPI } from "./action-api";

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

  const storeID: StoreID = nextStoreId();
  const storeName =
    options.name ??
    (`${storeID}:{${storesNameList
      .map((storeName) => stores[storeName].id())
      .join(",")}}` as JoinStoreName);

  const [validation, isCurrentStoreValid] = getValidationFn();
  const [id, name, get, watch, notify] = getCoreFn(
    () => storeID,
    () => storeName,
    () => states
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

      console.group(`${_storeName}.#up(${JSON.stringify(state)})`);
      const newStates = getStates();
      if (
        !isNewStateChanged(states, newStates) ||
        !isChildrenValid(states, newStates as ActionFnReturn<R>)
      ) {
        console.info("%c~not changed", "color: #FF5E5B");
        console.groupEnd();
        return;
      }
      console.info("%c~changed:", "color: #BDFF66", states, "->", newStates);
      states = newStates;
      info === undefined
        ? notify(states)
        : notify(states, {
            actionID: info.actionID,
            from: info.from.concat(storeID),
          });
      console.groupEnd();
    });

    if (isInnerStore(store)) {
      storesSet[_storeName as KeysOfStores<Stores>] = store.set;
    }
    if (isNotReadOnlyStore(store)) {
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
    console.group(
      `${storeName}.${info?.from.length === 0 ? info.actionID : "#set"} ->`,
      actionStates
    );

    if (
      actionStates == null ||
      !isNewStateChanged(states, actionStates) ||
      !isValid(states, actionStates)
    ) {
      console.info("%c~not changed", "color: #FF5E5B");
      console.groupEnd();
      return false;
    }

    isNotifyEnabled = false;
    let isChanged = false;
    const _info =
      info === undefined
        ? undefined
        : {
            actionID: info.actionID,
            from: info.from.concat(storeID),
          };
    for (const actionState of Object.keys(actionStates)) {
      if (
        storesSet[actionState as KeysOfStores<Stores>]?.(
          actionStates[actionState],
          _info
        )
      ) {
        isChanged = true;
      }
    }
    isNotifyEnabled = true;

    if (!isChanged) {
      console.info("%c~not changed", "color: #FF5E5B");
      console.groupEnd();
      return false;
    }

    const newStates = getStates();
    console.info("%c~changed:", "color: #BDFF66", states, "->", newStates);
    states = newStates;
    notify(states, _info);
    console.groupEnd();
    return true;
  };

  isNotifyEnabled = true;

  console.info(`${storeID} as "${storeName}" created`);

  return StoreInnerAPI.add({
    isReadOnly: false,
    id,
    name,
    get,
    watch,
    isValid,
    validation,
    set,
    action: (action, options) => {
      const _info = StoreInnerAPI.addActionInfo
        ? { actionID: ActionInnerAPI.add(nextActionId(), options), from: [] }
        : undefined;
      return (...args) => set(action(states, ...args), _info);
    },
  } as InnerStore<R>);
};
