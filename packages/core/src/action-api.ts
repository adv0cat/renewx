import { type ActionID, nextActionId } from "./utils/id";

const actionsNames = [] as string[];
const add = (name = ""): ActionID => {
  const id: ActionID = nextActionId();
  actionsNames[id] = name || `${id}`;
  return id;
};

const nameById = (actionID: ActionID) => actionsNames[actionID];

const setAddInfo = (value: boolean) => (ActionInnerAPI.addInfo = value);

export const ActionInnerAPI = { add, addInfo: false };
export const ActionAPI = { nameById, setAddInfo };
