import type { ActionID } from "../types/id";
import type { ActionInfo } from "../types/action";

let addInfo = false;
export const getAddInfo = (): boolean => addInfo;

let i: ActionID = 1;
const actionsNames = ["#set"];

export const newActionInfo = (name = ""): ActionInfo | undefined => {
  if (addInfo) {
    const id: ActionID = i++;
    actionsNames[id] = name || `${id}`;
    return { id, path: [] };
  }
};

export const getSetInfo = () =>
  addInfo ? ({ id: 0, path: [] } as ActionInfo) : undefined;

export const ActionAPI = {
  nameById: (actionID: ActionID) => actionsNames[actionID],
  setAddInfo: (value: boolean) => (addInfo = value),
};
