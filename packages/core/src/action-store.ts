import type { ToReadOnly, WritableTag } from "./types/tag";
import type { ReadOnlyStore } from "./types/read-only-store";
import type { Validator } from "./types/validator";
import type { Freeze } from "./types/freeze";
import type { ActionStore } from "./types/action-store";
import { getSetInfo } from "./api/action-api";
import { isStateChanged } from "./utils/is";
import type { Config } from "./types/config";
import { allStates, setNewState } from "./api/new-state-api";

export const actionStore = <State, TagType extends WritableTag>(
  readOnly: ReadOnlyStore<State, ToReadOnly<TagType>>,
  config: Config,
): ActionStore<State, TagType> => {
  const validators = [] as Validator<State>[];
  const isValid: ActionStore<State, TagType>["isValid"] = (
    oldState,
    newState,
  ) => validators.every((fn) => fn(oldState, newState));

  const { stateCheck } = config;
  const { id } = readOnly;
  const canSet: ActionStore<State, TagType>["canSet"] = (returned) => {
    const state = allStates[id];
    return (
      !readOnly.isOff &&
      (!stateCheck || isStateChanged(state, returned)) &&
      isValid(state, returned as Freeze<State>)
    );
  };

  const set: ActionStore<State, TagType>["set"] = (
    returned,
    info = getSetInfo(),
  ) => {
    const state = allStates[id];
    if (
      !readOnly.isOff &&
      (!stateCheck || isStateChanged(state, returned)) &&
      isValid(state, returned as Freeze<State>)
    ) {
      setNewState(id, returned as Freeze<State>, info);
    }
  };

  return {
    ...readOnly,
    tag: ("w" + readOnly.tag.slice(1)) as TagType,
    set,
    canSet,
    isValid,
    readOnly,
    validator: (fn) => {
      validators.push(fn);
      return () => {
        validators.splice(validators.indexOf(fn), 1);
      };
    },
  };
};
