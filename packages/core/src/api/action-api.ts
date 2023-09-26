import type { ActionID } from "../types/id";
import type { ActionInfo } from "../types/action";

let addInfo = false;
export const getAddInfo = (): boolean => addInfo;

let i: ActionID = 0;
const actionsNames = [] as string[];
export const newActionInfo = (name = ""): ActionInfo | undefined => {
  if (addInfo) {
    const id: ActionID = i++;
    actionsNames[id] = name || `${id}`;
    return { id, path: [] };
  }
};

export const ActionAPI = {
  nameById: (actionID: ActionID) => actionsNames[actionID],
  setAddInfo: (value: boolean) => (addInfo = value),
};
