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
import type { AdapterStoreID, JoinStoreID, StoreID } from "./id";

export interface ReadOnlyStore<State> {
  get(): Freeze<State>;
  watch(fn: Listener<State>): Unsubscribe;
  id(): StoreID | JoinStoreID | AdapterStoreID;
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

export type StoreOptions = Partial<{ name: string }>;
export type Listener<State> = (
  state: Freeze<State>,
  info: ActionInfo
) => Unsubscribe | void;
export type Notify<State> = (state: Freeze<State>, info: ActionInfo) => void;

export type AnyStore<State = any> = Store<State> | ReadOnlyStore<State>;
export type AnyStores = Record<string, AnyStore>;

export type StoreType<SomeStore extends AnyStore> = SomeStore extends AnyStore<
  infer Type
>
  ? Type
  : never;
export type StoresType<SomeStores extends AnyStores> = {
  [Name in keyof SomeStores]: StoreType<SomeStores[Name]>;
};

export type StoreActionType<SomeStore extends AnyStore> =
  SomeStore extends Store<any> ? ReturnType<SomeStore["action"]> : never;
export type StoresActionType<SomeStores extends AnyStores> = {
  [Name in keyof SomeStores]: StoreActionType<SomeStores[Name]>;
};
export type StoresAction<SomeStores extends AnyStores> = Pick<
  StoresActionType<SomeStores>,
  KeysOfStores<SomeStores>
>;

export type StoreIsValidType<SomeStore extends AnyStore> =
  SomeStore extends Store<any> ? SomeStore["isValid"] : never;
export type StoresIsValidType<SomeStores extends AnyStores> = {
  [Name in keyof SomeStores]: StoreIsValidType<SomeStores[Name]>;
};
export type StoresIsValid<SomeStores extends AnyStores> = Pick<
  StoresIsValidType<SomeStores>,
  KeysOfStores<SomeStores>
>;
