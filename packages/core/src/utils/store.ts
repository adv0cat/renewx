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
import type { Mark, StoreMark, WritableMark } from "./mark";

export interface ReadOnlyStore<
  State,
  MarkType extends Mark<string, boolean> = Mark<string>
> {
  id: StoreID;
  get(): Freeze<State>;
  watch(fn: Watcher<State>): Unsubscribe;
  name(): AnyStoreName;
  off(): void;
  isReadOnly: MarkType extends WritableMark ? false : true;
  mark: MarkType;
}

export interface ActionStore<State, MarkType extends WritableMark>
  extends ReadOnlyStore<State, MarkType> {
  validator(fn: Validator<State, MarkType>): Unsubscribe;
  isValid(
    oldState: Freeze<State>,
    newState: ActionFnReturn<State, MarkType> | Freeze<State>
  ): IsValid;
  newAction<NewActionFn extends ActionFn<State, MarkType>>(
    action: NewActionFn,
    name?: string
  ): (...args: OmitFirstArg<NewActionFn>) => IsChanged;
}

export interface Store<State> extends ActionStore<State, StoreMark> {}

export interface InnerStore<State, MarkType extends WritableMark>
  extends ActionStore<State, MarkType> {
  set(newState: ActionFnReturn<State, MarkType>, info?: ActionInfo): IsChanged;
}

export type AnyStore<
  State = any,
  MarkType extends Mark<string, boolean> = Mark<string, boolean>
> = ReadOnlyStore<State, MarkType>;

export type InnerStoresType<InnerStores> = {
  [Name in keyof InnerStores]: InnerStores[Name] extends InnerStore<
    infer Type,
    WritableMark
  >
    ? Type
    : never;
};

export type KeysOfInnerStores<InnerStores> = KeysOfObject<
  InnerStoresType<InnerStores>
>;

export const isInnerStore = <State>(
  store: AnyStore<State>
): store is InnerStore<State, WritableMark> => !store.isReadOnly;
