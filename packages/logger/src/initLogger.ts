import { ActionAPI, StoreAPI, type Unsubscribe, watch } from "@renewx/core";

let isInitialized = false;
export const initLogger = (log: (...data: any[]) => void): Unsubscribe => {
  if (isInitialized) {
    return () => {};
  }
  isInitialized = true;

  ActionAPI.setAddInfo(true);
  const unsubscribe = StoreAPI.watch((storeID) => {
    const store = StoreAPI.storeById(storeID);
    if (store !== undefined) {
      const storeName = store.name();
      watch(
        store,
        (v, info) => {
          if (info === undefined) {
            return;
          }

          const { id: actionID, path: storeIDList } = info;
          if (~actionID) {
            const actionName = ActionAPI.nameById(actionID);
            if (storeIDList.length === 1) {
              log(`${storeName}.${actionName}:`, v);
            } else {
              const pathOfAction = storeIDList
                .map(
                  (storeID, index) =>
                    StoreAPI.storeById(storeID)?.name() +
                    (index === 0 ? `.${actionName}` : ""),
                )
                .join(" --> ");
              log(`${pathOfAction}.#up:`, v);
            }
          } else {
            log(`${storeName}.#init:`, v);
          }
        },
        { stateCheck: false },
      );
    }
  });

  return () => {
    ActionAPI.setAddInfo(false);
    unsubscribe();
    isInitialized = false;
  };
};
