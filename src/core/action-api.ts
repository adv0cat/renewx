import type { ActionID } from "../interfaces/id";
import type { ActionOptions } from "../interfaces/action";

const actionsNames = [] as string[];
const add = (id: ActionID, options?: ActionOptions): ActionID => {
  actionsNames[id] = options?.name ?? `${id}`;
  return id;
};

const actionNameById = (actionID: ActionID) => actionsNames[actionID];

const setAddInfo = (value: boolean) => (ActionInnerAPI.addInfo = value);

export const ActionInnerAPI = { add, addInfo: false };
export const ActionAPI = { actionNameById, setAddInfo };
