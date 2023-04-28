import type {
  AnyStores,
  Store,
  StoresType,
  StoresAction,
  StoresIsValid,
} from "../interfaces/store";
import type { Unsubscribe, KeysOfStores } from "../interfaces/core";
import type { ActionFnReturn } from "../interfaces/action";
import type { ActionID, JoinStoreID } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import { nextActionId } from "../utils/id";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getCoreFn } from "../utils/get-core-fn";
import { isNotReadOnlyStore, isNewStateChanged } from "../utils/is";
import { getValidationFn } from "../utils/get-validation-fn";

export const join = <Stores extends AnyStores, R extends StoresType<Stores>>(
  stores: Stores
): Store<R> => {
  const storesNameList = Object.keys(stores) as (keyof Stores)[];
  const getStates = () => {
    const states = {} as R;
    storesNameList.forEach(
      (storeName) => (states[storeName] = stores[storeName].get())
    );
    return states as Freeze<R>;
  };
  let states = getStates();

  const storeID: JoinStoreID = `{${storesNameList
    .map((storeName) => stores[storeName].id())
    .join(";")}}`;

  const [validation, isCurrentStoreValid] = getValidationFn();
  const [get, id, watch, notify] = getCoreFn(
    () => states,
    () => storeID
  );

  console.info(`${storeID} created`);

  let isNotifyEnabled = false;

  const unsubscribes = {} as Record<keyof Stores, Unsubscribe>;
  const storesAction = {} as StoresAction<Stores>;
  const storesIsValid = {} as StoresIsValid<Stores>;

  for (const storeName of storesNameList) {
    const store = stores[storeName];
    const actionID = `${storeID}.${store.id()}.#set` as ActionID;

    unsubscribes[storeName] = store.watch((state, info) => {
      if (!isNotifyEnabled) {
        return;
      }
      console.group(`${actionID}(${JSON.stringify(state)})`);
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
      notify(states, info);
      console.groupEnd();
    });

    if (isNotReadOnlyStore(store)) {
      storesAction[storeName as KeysOfStores<Stores>] = store.action(
        (_, value) => value,
        { id: actionID }
      );
      storesIsValid[storeName as KeysOfStores<Stores>] = store.isValid;
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

  isNotifyEnabled = true;

  return {
    isReadOnly: false,
    id,
    get,
    watch,
    isValid,
    validation,
    action: (action, { id } = {}) => {
      const actionID: ActionID = nextActionId(id);
      return (...args) => {
        console.group(`${storeID} ${actionID}(${getArgsForLog(args)})`);

        const actionStates = action(states, ...args);
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
        for (const actionState of Object.keys(actionStates)) {
          if (
            storesAction[actionState as KeysOfStores<Stores>]?.(
              actionStates[actionState]
            )
          ) {
            isChanged = true;
          }
        }
        isNotifyEnabled = true;

        if (!isChanged) {
          return false;
        }

        const newStates = getStates();
        console.info("%c~changed:", "color: #BDFF66", states, "->", newStates);
        states = newStates;
        notify(states, { actionID });
        console.groupEnd();
        return true;
      };
    },
  } as Store<R>;
};
