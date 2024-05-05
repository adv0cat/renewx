import { ActionAPI, StoreAPI, type Unsubscribe, watch } from "@renewx/core";

let unWatch: 0 | Unsubscribe = 0;
export const initLogger = (log: (...data: any[]) => void): Unsubscribe => {
  if (unWatch === 0) {
    ActionAPI.setAddInfo(true);
    const unsubscribe = StoreAPI.watch((storeID) => {
      const store = StoreAPI.storeById(storeID);
      if (store !== undefined) {
        const storeName = store.name();
        watch(
          store,
          (v, isFirst, info) => {
            if (info !== undefined) {
              const { id: actionID, path: storeIDList } = info;
              if (isFirst) {
                log(`${storeName}.#init:`, v);
              } else {
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
              }
            }
          },
          { stateCheck: false },
        );
      }
    });

    unWatch = () => {
      ActionAPI.setAddInfo(false);
      unsubscribe();
      unWatch = 0;
    };
  }

  return unWatch;
};
