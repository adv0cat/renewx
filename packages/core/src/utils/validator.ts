import type { Freeze } from "./freeze";
import type { IsValid } from "./core";
import type { ActionFnReturn } from "./action";
import type { ActionStore } from "./store";
import type { WritableMark } from "./mark";

export type Validator<State, MarkType extends WritableMark> = (
  old: Freeze<State>,
  state: ActionFnReturn<State, MarkType> | Freeze<State>
) => IsValid;

export const newValidator = <State, MarkType extends WritableMark>(): [
  ActionStore<State, MarkType>["validator"],
  ActionStore<State, MarkType>["isValid"]
] => {
  const validators = [] as Validator<State, MarkType>[];
  return [
    (fn) => {
      validators.push(fn);
      return () => {
        validators.splice(validators.indexOf(fn), 1);
      };
    },
    (
      oldState: Freeze<State>,
      newState: ActionFnReturn<State, MarkType> | Freeze<State>
    ) => validators.every((fn) => fn(oldState, newState)),
  ];
};
