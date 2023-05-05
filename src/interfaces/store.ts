import type {
  IsChanged,
  IsValid,
  KeysOfStores,
  OmitFirstArg,
  Unsubscribe,
} from "./core";
import type {
  ActionFn,
  ActionFnReturn,
  ActionInfo,
  ActionOptions,
} from "./action";
import type { ValidationFn } from "./validation";
import type { Freeze } from "../utils/freeze";
import type { StoreID, AnyStoreName } from "./id";

export interface ReadOnlyStore<State> {
  id: StoreID;
  get(): Freeze<State>;
  watch(fn: Listener<State>): Unsubscribe;
  name(): AnyStoreName;
  isReadOnly: boolean;
}
export interface Store<State> extends ReadOnlyStore<State> {
  validation(fn: ValidationFn<State>): Unsubscribe;
  isValid(oldState: Freeze<State>, newState: ActionFnReturn<State>): IsValid;
  action<NewActionFn extends ActionFn<State>>(
    action: NewActionFn,
    options?: ActionOptions
  ): (...args: OmitFirstArg<NewActionFn>) => IsChanged;
}

export interface InnerStore<State> extends Store<State> {
  set(newState: ActionFnReturn<State>, info?: ActionInfo): IsChanged;
}

export type StoreOptions = Partial<{ name: string }>;
export type Listener<State> = (
  state: Freeze<State>,
  info?: ActionInfo
) => Unsubscribe | void;
export type Notify<State> = (state: Freeze<State>, info?: ActionInfo) => void;

export type AnyStore<State = any> = Store<State> | ReadOnlyStore<State>;
export type AnyStores = Record<string, AnyStore>;

export type FreezeStoreType<SomeStore extends AnyStore> =
  SomeStore extends AnyStore<infer Type> ? Freeze<Type> : never;
export type FreezeStoreListType<SomeStoreList extends AnyStore[]> = {
  [Index in keyof SomeStoreList]: FreezeStoreType<SomeStoreList[Index]>;
};

export type StoreType<SomeStore extends AnyStore> = SomeStore extends AnyStore<
  infer Type
>
  ? Type
  : never;
export type StoresType<SomeStores extends AnyStores> = {
  [Name in keyof SomeStores]: StoreType<SomeStores[Name]>;
};

export type StoresSet<SomeStores extends AnyStores> = Record<
  KeysOfStores<SomeStores>,
  InnerStore<any>["set"]
>;

export type StoresIsValid<SomeStores extends AnyStores> = Record<
  KeysOfStores<SomeStores>,
  Store<any>["isValid"]
>;
