import type { ActionID } from "../interfaces/id";

const actionsNames = [] as string[];
const add = (id: ActionID, name = ""): ActionID => {
  actionsNames[id] = name || `${id}`;
  return id;
};

const actionNameById = (actionID: ActionID) => actionsNames[actionID];

const setAddInfo = (value: boolean) => (ActionInnerAPI.addInfo = value);

export const ActionInnerAPI = { add, addInfo: false };
export const ActionAPI = { actionNameById, setAddInfo };
