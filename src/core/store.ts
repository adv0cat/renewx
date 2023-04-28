import type { Store, StoreOptions } from "../interfaces/store";
import type { ActionID, StoreID } from "../interfaces/id";
import type { Freeze } from "../utils/freeze";
import { nextActionId, nextStoreId } from "../utils/id";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getCoreFn } from "../utils/get-core-fn";
import { getValidationFn } from "../utils/get-validation-fn";
import { isNewStateChanged } from "../utils/is";

export const store = <State>(
  initState: State,
  { name }: StoreOptions = {}
): Store<State> => {
  let state = initState as Freeze<State>;
  const storeID: StoreID = `[${nextStoreId(name)}]`;

  const [validation, isValid] = getValidationFn();
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
    isValid,
    validation,
    action: (action, { id } = {}) => {
      const actionID: ActionID = nextActionId(id);
      return (...args) => {
        console.group(`${storeID} ${actionID}(${getArgsForLog(args)})`);

        const newState = action(state, ...args);
        if (!isNewStateChanged(state, newState) || !isValid(state, newState)) {
          console.info("%c~not changed", "color: #FF5E5B");
          console.groupEnd();
          return false;
        }

        console.info("%c~changed:", "color: #BDFF66", state, "->", newState);
        state = newState as Freeze<State>;
        notify(state, { actionID });
        console.groupEnd();
        return true;
      };
    },
  } as Store<State>;
};
