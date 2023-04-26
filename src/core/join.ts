import type {
  AnyStores,
  Store,
  StoresType,
  StoresAction,
  StoresIsValid,
} from "../interfaces/store";
import type { Unsubscribe } from "../interfaces/core";
import type { ActionFnReturn } from "../interfaces/action";
import type { ActionID, JoinStoreID } from "../interfaces/id";
import { nextActionId } from "../utils/id";
import { freeze } from "../utils/freeze";
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
    return freeze<R>(states);
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

  // TODO: maybe concat actions and isValidStores
  const unsubscribes: Record<string, Unsubscribe> = {};
  const actions = storesNameList.reduce((result, storeName) => {
    const store = stores[storeName];
    const storeNameStr = String(storeName);
    if (!(storeNameStr in unsubscribes)) {
      unsubscribes[storeNameStr] = store.watch((state, info) => {
        if (!isNotifyEnabled) {
          return;
        }
        console.group(
          `${storeID} ${storeNameStr}.#set(${JSON.stringify(state)})`
        );
        const newStates = getStates();
        if (
          !isNewStateChanged(states, newStates) ||
          !isValid(states, newStates as ActionFnReturn<R>)
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
        result[storeName as keyof StoresAction<Stores>] = store.action(
          (_, value) => value,
          { id: `${storeNameStr}.#set` as ActionID }
        ) as StoresAction<Stores>[keyof StoresAction<Stores>];
      }
    }
    return result;
  }, {} as StoresAction<Stores>);
  const actionsNameList = Object.keys(
    actions
  ) as (keyof StoresAction<Stores>)[];

  const isValidStores = storesNameList.reduce((result, storeName) => {
    const store = stores[storeName];
    const resultStoreName = storeName as keyof StoresIsValid<Stores>;
    if (!(resultStoreName in result) && isNotReadOnlyStore(store)) {
      result[resultStoreName] =
        store.isValid as StoresIsValid<Stores>[keyof StoresIsValid<Stores>];
    }
    return result;
  }, {} as StoresIsValid<Stores>);
  const isValidNameList = Object.keys(
    isValidStores
  ) as (keyof StoresIsValid<Stores>)[];

  const isValid: Store<R>["isValid"] = (oldState, newState) =>
    isValidNameList.every((storeName) =>
      storeName in newState
        ? isValidStores[storeName](oldState[storeName], newState[storeName])
        : true
    ) && isCurrentStoreValid(oldState, newState);

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
        const isChanged = actionsNameList.reduce(
          (isChanged, storeName) =>
            (storeName in actionStates
              ? actions[storeName](actionStates[storeName])
              : false) || isChanged,
          false
        );
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
