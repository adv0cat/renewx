import type { IsChanged, IsValid, OmitFirstArg, Unsubscribe } from "./core";
import type { ActionFn, ActionFnReturn, ActionInfo } from "./action";
import type { ValidationFn } from "./validation";
import type { Freeze } from "../utils/freeze";
import type { StoreID, AnyStoreName } from "./id";

export interface ReadOnlyStore<State> {
  id: StoreID;
  get(): Freeze<State>;
  watch(fn: Watcher<State>): Unsubscribe;
  name(): AnyStoreName;
  isReadOnly: boolean;
  off(): void;
}
export interface Store<State> extends ReadOnlyStore<State> {
  validation(fn: ValidationFn<State>): Unsubscribe;
  isValid(oldState: Freeze<State>, newState: ActionFnReturn<State>): IsValid;
  updater<NewActionFn extends ActionFn<State>>(
    action: NewActionFn,
    name?: string
  ): (...args: OmitFirstArg<NewActionFn>) => IsChanged;
}

export interface InnerStore<State> extends Store<State> {
  set(newState: ActionFnReturn<State>, info?: ActionInfo): IsChanged;
}

export type AnyStore<State = any> = Store<State> | ReadOnlyStore<State>;
export type AnyStores = Record<string, AnyStore>;

export type Watcher<State> = (
  state: Freeze<State>,
  info?: ActionInfo
) => Unsubscribe | void;
export type Notify<State> = (state: Freeze<State>, info?: ActionInfo) => void;

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
