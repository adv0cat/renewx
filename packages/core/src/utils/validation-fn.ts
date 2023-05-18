import type { Freeze } from "./freeze";
import type { IsValid } from "./core";
import type { Store } from "./store";
import type { ActionFnReturn } from "./action";

export type ValidationFn<State> = (
  old: Freeze<State>,
  state: ActionFnReturn<State>
) => IsValid;

export const validationFn = <State>(): [
  Store<State>["validation"],
  Store<State>["isValid"]
] => {
  const validationList = [] as ValidationFn<State>[];
  return [
    (fn) => {
      validationList.push(fn);
      return () => {
        validationList.splice(validationList.indexOf(fn), 1);
      };
    },
    (oldState: Freeze<State>, newState: ActionFnReturn<State>) =>
      validationList.every((fn) => fn(oldState, newState)),
  ];
};
