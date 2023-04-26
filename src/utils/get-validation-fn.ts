import type { Store } from "../interfaces/store";
import type { ValidationFn } from "../interfaces/validation";
import type { Freeze } from "./freeze";
import type { ActionFnReturn } from "../interfaces/action";

export const getValidationFn = <State>(): [
  Store<State>["validation"],
  Store<State>["isValid"]
] => {
  const validationList = [] as ValidationFn<State>[];
  return [
    (fn) => {
      validationList.push(fn);
      return () => validationList.splice(validationList.indexOf(fn), 1);
    },
    (oldState: Freeze<State>, newState: ActionFnReturn<State>) =>
      validationList.every((fn) => fn(oldState, newState)),
  ];
};
