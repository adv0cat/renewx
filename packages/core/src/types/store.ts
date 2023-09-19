import type { Validator } from "../utils/validator";
import type { ActionFn } from "./action";
import type { IsChanged, IsValid, OmitFirstArg, Unsubscribe } from "./core";
import type { StoreTag, ToReadOnly, WritableTag } from "./tag";
import type { Freeze } from "./freeze";
import type { ReadOnlyStore } from "./read-only-store";

export interface ActionStore<State, TagType extends WritableTag>
  extends ReadOnlyStore<State, TagType> {
  readOnly(): ReadOnlyStore<State, ToReadOnly<TagType>>;
  validator(fn: Validator<State>): Unsubscribe;
  isValid(oldState: Freeze<State>, newState: Freeze<State>): IsValid;
  newAction<NewActionFn extends ActionFn<State, TagType>>(
    action: NewActionFn,
    name?: string,
  ): (...args: OmitFirstArg<NewActionFn>) => IsChanged;
}

export interface Store<State> extends ActionStore<State, StoreTag> {}
