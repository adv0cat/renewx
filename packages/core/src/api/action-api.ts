import { type ActionID, nextActionId } from "../utils/id";
import type { ActionInfo } from "../types/action";

let addInfo = false;
export const getAddInfo = (): boolean => addInfo;

const actionsNames = [] as string[];
export const newActionInfo = (name = ""): ActionInfo | undefined => {
  if (addInfo) {
    const id: ActionID = nextActionId();
    actionsNames[id] = name || `${id}`;
    return { id, path: [] };
  }
};

export const ActionAPI = {
  nameById: (actionID: ActionID) => actionsNames[actionID],
  setAddInfo: (value: boolean) => (addInfo = value),
};
