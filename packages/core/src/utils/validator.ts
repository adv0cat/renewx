import type { ActionStore } from "../types/store";
import type { IsValid } from "../types/core";
import type { WritableTag } from "../types/tag";
import type { Freeze } from "../types/freeze";

export type Validator<State> = (
  old: Freeze<State>,
  state: Freeze<State>,
) => IsValid;

export const newValidator = <State, TagType extends WritableTag>(): [
  ActionStore<State, TagType>["validator"],
  ActionStore<State, TagType>["isValid"],
] => {
  const validators = [] as Validator<State>[];
  return [
    (fn) => {
      validators.push(fn);
      return () => {
        validators.splice(validators.indexOf(fn), 1);
      };
    },
    (oldState: Freeze<State>, newState: Freeze<State>) =>
      validators.every((fn) => fn(oldState, newState)),
  ];
};
