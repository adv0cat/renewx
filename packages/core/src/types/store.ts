import type { Validator } from "../utils/validator";
import type { StoreID } from "../utils/id";
import type { Watcher } from "../utils/core-fn";
import type { ActionFn, ActionFnReturn } from "./action";
import type { IsChanged, IsValid, OmitFirstArg, Unsubscribe } from "./core";
import type {
  AnyTag,
  ReadableTag,
  StoreTag,
  ToReadOnly,
  WritableTag,
} from "./tag";
import type { Freeze } from "./freeze";
import type { AnyStoreName } from "./name";

export interface ReadOnlyStore<State, TagType extends AnyTag = ReadableTag> {
  id: StoreID;
  get(): Freeze<State>;
  watch(fn: Watcher<State>): Unsubscribe;
  name(): AnyStoreName;
  off(): void;
  isReadOnly: TagType extends WritableTag ? false : true;
  tag: TagType;
}

export interface ActionStore<State, TagType extends WritableTag>
  extends ReadOnlyStore<State, TagType> {
  readOnly(): ReadOnlyStore<State, ToReadOnly<TagType>>;
  validator(fn: Validator<State, TagType>): Unsubscribe;
  isValid(
    oldState: Freeze<State>,
    newState: ActionFnReturn<State, TagType> | Freeze<State>,
  ): IsValid;
  newAction<NewActionFn extends ActionFn<State, TagType>>(
    action: NewActionFn,
    name?: string,
  ): (...args: OmitFirstArg<NewActionFn>) => IsChanged;
}

export interface Store<State> extends ActionStore<State, StoreTag> {}
