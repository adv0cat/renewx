import type { ToReadOnly, WritableTag } from "./types/tag";
import type { ReadOnlyStore } from "./types/read-only-store";
import type { Validator } from "./types/validator";
import type { Freeze } from "./types/freeze";
import type { ActionStore } from "./types/action-store";

export const actionStore = <State, TagType extends WritableTag>(
  readOnly: ReadOnlyStore<State, ToReadOnly<TagType>>,
): Omit<ActionStore<State, TagType>, "set" | "newAction"> => {
  const validators = [] as Validator<State>[];

  return {
    ...readOnly,
    tag: ("w" + readOnly.tag.slice(1)) as TagType,
    readOnly: () => readOnly,
    validator: (fn) => {
      validators.push(fn);
      return () => {
        validators.splice(validators.indexOf(fn), 1);
      };
    },
    isValid: (oldState: Freeze<State>, newState: Freeze<State>) =>
      validators.every((fn) => fn(oldState, newState)),
  };
};
