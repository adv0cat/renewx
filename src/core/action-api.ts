import type { ActionID } from "../interfaces/id";
import { ActionOptions } from "../interfaces/action";

const actionsNames = [] as string[];

const add = (id: number, options?: ActionOptions): ActionID => {
  actionsNames[id] = options?.name ?? `${id}`;
  return id;
};
const actionNameById = (actionID: number) => actionsNames[actionID];

export const ActionInnerAPI = { add };
export const ActionAPI = { actionNameById };
