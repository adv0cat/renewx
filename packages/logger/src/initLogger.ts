import { ActionAPI, StoreAPI, type Unsubscribe } from "@renewx/core";

let isInitialized = false;
export const initLogger = (): Unsubscribe => {
  if (isInitialized) {
    return () => void 0;
  }
  isInitialized = true;

  ActionAPI.setAddInfo(true);
  const unsubscribe = StoreAPI.watch((storeID) => {
    const store = StoreAPI.storeById(storeID);
    if (store !== undefined) {
      const storeName = store.name();
      store.watch((v, info) => {
        if (info === undefined) {
          return;
        }

        const { id: actionID, path: storeIDList, set } = info;
        if (actionID === -1) {
          console.log(`${storeName}.#init:`, v);
          return;
        }

        const actionName = ActionAPI.nameById(actionID);
        if (storeIDList.length === 1) {
          console.log(`${storeName}.${actionName}:`, v);
        } else {
          const pathOfAction = storeIDList
            .map(
              (storeID, index) =>
                StoreAPI.storeById(storeID)?.name() +
                (index === 0 ? `.${actionName}` : "")
            )
            .join(" --> ");
          console.log(`${pathOfAction}.#${set ? "set" : "up"}:`, v);
        }
      });
    }
  });

  return () => {
    ActionAPI.setAddInfo(false);
    unsubscribe();
    isInitialized = false;
  };
};
