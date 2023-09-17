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
import type { ActionFnJoinReturn, JoinState, JoinStore } from "./types/join";
import type { Freeze } from "./types/freeze";
import type { JoinStoreName } from "./types/name";
import type { Config } from "./types/config";
import { readOnlyStore } from "./read-only-store";
import { getNotify } from "./api/queue-api";
import { newActionInfo } from "./api/action-api";

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

  let isNotifyEnabled = false;
  const readOnly = readOnlyStore(
    storeName,
    "join-readOnly",
    () => states,
    (storeID): JoinStoreName => `${storeID}:{${nameList.join(",")}}`,
    () => {
      isNotifyEnabled = false;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      unsubscribes = [];
    },
  );
  const id = readOnly.id;
  const notify = getNotify(readOnly);

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
