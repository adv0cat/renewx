import { ActionAPI, StoreAPI, type Unsubscribe, watch } from "@renewx/core";

let unWatch: 0 | Unsubscribe = 0;
export const initLogger = (log: (...data: any[]) => void): Unsubscribe => {
  if (unWatch === 0) {
    ActionAPI.setAddInfo(true);
    const unsubscribe = StoreAPI.watch((storeID) => {
      const store = StoreAPI.storeById(storeID);
      if (store) {
        const storeName = store.name();
        watch(
          store,
          (v, isFirst, info) => {
            if (info) {
              if (isFirst) {
                log(storeName + ".#init:", v);
              } else {
                const storeIDList = info.path;
                const actionName = "." + ActionAPI.nameById(info.id);
                log(
                  storeIDList.length > 1
                    ? storeIDList
                        .map(
                          (storeID, index) =>
                            StoreAPI.storeById(storeID)?.name() +
                            (index === 0 ? actionName : ""),
                        )
                        .join(" --> ") + ".#up:"
                    : storeName + actionName + ":",
                  v,
                );
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
