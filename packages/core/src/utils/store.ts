import type { StoreID } from "./id";
import type { Freeze } from "./freeze";
import type { Watcher } from "./core-fn";
import type {
  IsChanged,
  IsValid,
  KeysOfObject,
  OmitFirstArg,
  Unsubscribe,
} from "./core";
import type { AnyStoreName } from "./name";
import type { Validator } from "./validator";
import type { ActionFn, ActionFnReturn, ActionInfo } from "./action";
import type { AnyTag, StoreTag, Tag, WritableTag } from "./tag";

export interface ReadOnlyStore<State, TagType extends AnyTag = Tag<string>> {
  id: StoreID;
  get(): Freeze<State>;
  watch(fn: Watcher<State>): Unsubscribe;
  name(): AnyStoreName;
  off(): void;
  isReadOnly: TagType extends WritableTag ? false : true;
  mark: TagType;
}

export interface ActionStore<State, TagType extends WritableTag>
  extends ReadOnlyStore<State, TagType> {
  validator(fn: Validator<State, TagType>): Unsubscribe;
  isValid(
    oldState: Freeze<State>,
    newState: ActionFnReturn<State, TagType> | Freeze<State>
  ): IsValid;
  newAction<NewActionFn extends ActionFn<State, TagType>>(
    action: NewActionFn,
    name?: string
  ): (...args: OmitFirstArg<NewActionFn>) => IsChanged;
}

export interface Store<State> extends ActionStore<State, StoreTag> {}

export interface InnerStore<State, TagType extends WritableTag>
  extends ActionStore<State, TagType> {
  set(newState: ActionFnReturn<State, TagType>, info?: ActionInfo): IsChanged;
}

export type AnyStore<
  State = any,
  TagType extends AnyTag = AnyTag
> = ReadOnlyStore<State, TagType>;

export type InnerStoresType<InnerStores> = {
  [Name in keyof InnerStores]: InnerStores[Name] extends InnerStore<
    infer Type,
    WritableTag
  >
    ? Type
    : never;
};

export type KeysOfInnerStores<InnerStores> = KeysOfObject<
  InnerStoresType<InnerStores>
>;

export const isInnerStore = <State>(
  store: AnyStore<State>
): store is InnerStore<State, WritableTag> => !store.isReadOnly;
