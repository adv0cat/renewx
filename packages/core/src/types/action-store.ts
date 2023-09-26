import type {
  IsChanged,
  IsValid,
  KeysOfObject,
  OmitFirstArg,
  Unsubscribe,
} from "./core";
import type { AnyActionStore, AnyStore } from "./any-store";
import type { ToReadOnly, WritableTag } from "./tag";
import type { ReadOnlyStore } from "./read-only-store";
import type { Validator } from "./validator";
import type { Freeze } from "./freeze";
import type { ActionFn, ActionFnReturn, ActionInfo } from "./action";

export type OnlyActionStores<Stores extends Record<string, AnyStore>> = {
  [Index in keyof Stores]: Stores[Index] extends AnyActionStore<infer State>
    ? State
    : never;
};
export type KeysOfActionStores<Stores extends Record<string, AnyStore>> =
  KeysOfObject<OnlyActionStores<Stores>>;

export interface ActionStore<State, TagType extends WritableTag>
  extends ReadOnlyStore<State, TagType> {
  readOnly(): ReadOnlyStore<State, ToReadOnly<TagType>>;
  validator(fn: Validator<State>): Unsubscribe;
  isValid(oldState: Freeze<State>, newState: Freeze<State>): IsValid;
  set(newState: ActionFnReturn<State, TagType>, info?: ActionInfo): IsChanged;
  newAction<NewActionFn extends ActionFn<State, TagType>>(
    action: NewActionFn,
    name?: string,
  ): (...args: OmitFirstArg<NewActionFn>) => IsChanged;
}

export const isActionStore = <State>(
  store: AnyStore<State>,
): store is AnyActionStore<State> => store.tag[0] === "w";
