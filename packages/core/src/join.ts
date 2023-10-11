import type { AnyStore } from "./types/any-store";
import type { JoinStore } from "./types/join";
import type { Config } from "./types/config";

export const join = <Stores extends Record<string, AnyStore>>(
  stores: Stores,
  storeName: string = "",
  config: Partial<Config> = {},
): JoinStore<Stores> => {
  throw new Error("Not implemented!");
  // const { stateCheck } = mergeConfig(config);
  //
  // const nameList = Object.keys(stores) as (string & keyof Stores)[];
  // const storeList = nameList.map((name) => stores[name]);
  // const actionStoreMap = new Map<KeysOfActionStores<Stores>, AnyActionStore>();
  // storeList.forEach(
  //   (store, index) =>
  //     isActionStore(store) &&
  //     actionStoreMap.set(nameList[index] as KeysOfActionStores<Stores>, store),
  // );
  //
  // const getStates = () => {
  //   const states = {} as JoinState<Stores>;
  //   nameList.forEach((name) => (states[name] = stores[name].get()));
  //   return states as Freeze<JoinState<Stores>>;
  // };
  // let states = getStates();
  //
  // let isNotifyEnabled = true;
  // const _readOnlyStore = readOnlyStore(
  //   getStates(),
  //   storeName,
  //   (storeID): JoinStoreName => `${storeID}:{${nameList.join(",")}}`,
  //   "rj",
  //   () => {
  //     isNotifyEnabled = false;
  //     unsubscribe();
  //   },
  // );
  //
  // const _actionStore = actionStore<JoinState<Stores>, JoinTag>(
  //   _readOnlyStore,
  //   mergeConfig(config),
  // );
  // const notify = getNotify<JoinState<Stores>>(_actionStore.id);
  // const setInfo = newActionInfo("set");
  // const set: ActionStore<JoinState<Stores>, JoinTag>["set"] = (
  //   partialNewStates,
  //   info = setInfo,
  // ) => {
  //   if (!isNotifyEnabled || partialNewStates == null) {
  //     return false;
  //   }
  //
  //   const newStates: Freeze<JoinState<Stores>> = Object.assign({}, states);
  //   for (const key in partialNewStates) {
  //     if (key in newStates) {
  //       newStates[key] =
  //         partialNewStates[key as keyof ActionFnJoinReturn<Stores>];
  //     }
  //   }
  //   if (
  //     !(!stateCheck || isStateChanged(states, newStates)) ||
  //     !_actionStore.isValid(states, newStates)
  //   ) {
  //     return false;
  //   }
  //
  //   const storeInfo =
  //     info &&
  //     ({
  //       id: info.id,
  //       path: info.path.concat(_readOnlyStore.id),
  //     } as ActionInfo);
  //
  //   isNotifyEnabled = false;
  //   for (const [name, store] of actionStoreMap) {
  //     if (name in partialNewStates) {
  //       store.set(
  //         partialNewStates[name as keyof ActionFnJoinReturn<Stores>],
  //         storeInfo,
  //       );
  //     }
  //   }
  //   isNotifyEnabled = true;
  //
  //   return notify((states = getStates()), info, true);
  // };
  //
  // const unsubscribe = watch(
  //   storeList,
  //   (_, info) => {
  //     if (isNotifyEnabled) {
  //       const newStates = getStates();
  //       if (_actionStore.isValid(states, newStates)) {
  //         notify((states = newStates), info);
  //       }
  //     }
  //   },
  //   config,
  // );
  //
  // _actionStore.validator((oldState, newState) => {
  //   for (const [name, store] of actionStoreMap) {
  //     if (!store.isValid(oldState[name], newState[name])) {
  //       return false;
  //     }
  //   }
  //   return true;
  // });
  //
  // return saveStore({
  //   ..._actionStore,
  //   set,
  //   newAction: (action, name) => {
  //     const info = newActionInfo(name);
  //     return (...args) => set(action(states, ...args), info);
  //   },
  // });
};
