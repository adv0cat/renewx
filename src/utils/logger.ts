import { ActionAPI } from "../core/action-api";
import { StoreAPI } from "../core/store-api";

export const initLog = () => {
  ActionAPI.setAddInfo(true);
  StoreAPI.watcher({
    watch: (storeID) => {
      const store = StoreAPI.storeById(storeID);
      if (store !== undefined) {
        const storeName = store.name();
        store.watch((v, info) => {
          if (info === undefined) {
            return;
          }

          if (info.id === -1) {
            console.log(`${storeName}.#init:`, v);
            return;
          }

          const actionName = ActionAPI.actionNameById(info.id);
          if (info.from.length === 1) {
            console.log(`${storeName}.${actionName}:`, v);
          } else {
            const actionPath = info.from
              .map(
                (storeID, index) =>
                  StoreAPI.storeById(storeID)?.name() +
                  (index === 0 ? `.${actionName}` : "")
              )
              .join(" --> ");
            console.log(`${actionPath}.#${info.isSet ? "set" : "up"}:`, v);
          }
        });
      }
    },
  });
};
