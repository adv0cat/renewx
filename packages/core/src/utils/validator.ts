import type { Freeze } from "./freeze";
import type { IsValid } from "./core";
import type { Store } from "./store";
import type { ActionFnReturn } from "./action";

export type Validator<State> = (
  old: Freeze<State>,
  state: ActionFnReturn<State>
) => IsValid;

export const newValidator = <State>(): [
  Store<State>["validator"],
  Store<State>["isValid"]
] => {
  const validators = [] as Validator<State>[];
  return [
    (fn) => {
      validators.push(fn);
      return () => {
        validators.splice(validators.indexOf(fn), 1);
      };
    },
    (oldState: Freeze<State>, newState: ActionFnReturn<State>) =>
      validators.every((fn) => fn(oldState, newState)),
  ];
};
