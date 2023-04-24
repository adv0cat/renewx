import type { Store, StoreOptions } from "../interfaces/store";
import type { ActionID, StoreID } from "../interfaces/id";
import { nextActionId, nextStoreId } from "../utils/id";
import { freeze } from "../utils/freeze";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getCoreFn } from "../utils/get-core-fn";

export const store = <State>(
  initState: State,
  { name }: StoreOptions = {}
): Store<State> => {
  let state = freeze(initState);
  const storeID: StoreID = `[${nextStoreId(name)}]`;

  const [get, id, watch, notify] = getCoreFn(
    () => state,
    () => storeID
  );

  console.info(`${storeID} created`);

  return {
    isReadOnly: false,
    id,
    get,
    watch,
    action: (action, { id } = {}) => {
      const actionID: ActionID = nextActionId(id);
      return (...args) => {
        console.group(`${storeID} ${actionID}(${getArgsForLog(args)})`);
        const newState = action(state, ...args);
        if (state !== newState) {
          console.info("%c changed:", "color: #BDFF66", state, "->", newState);
          state = freeze(newState);
          notify(state, { actionID });
          console.groupEnd();
          return true;
        }
        console.info("%c not changed", "color: #FF5E5B");
        console.groupEnd();
      };
    },
  } as Store<State>;
};
