import type { isReadOnly, ToReadOnly, WritableTag } from "./types/tag";
import type { ReadOnlyStore } from "./types/read-only-store";
import type { ActionStore } from "./types/store";
import type { AnyActionStore, AnyStore } from "./types/any-store";
import type { Validator } from "./types/validator";
import type { Freeze } from "./types/freeze";

export const actionStore = <State, TagType extends WritableTag>(
  readOnly: ReadOnlyStore<State, ToReadOnly<TagType>>,
): Omit<ActionStore<State, TagType>, "set" | "newAction"> => {
  const validators = [] as Validator<State>[];

  return {
    ...readOnly,
    tag: (readOnly.tag.split("-")[0] + "-writable") as TagType,
    isReadOnly: false as isReadOnly<TagType>,
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

export const isActionStore = <State>(
  store: AnyStore<State>,
): store is AnyActionStore<State> => !store.isReadOnly;
