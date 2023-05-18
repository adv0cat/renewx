import type { StoreID } from "./id";
import type { Freeze } from "./freeze";
import type { Watcher } from "./core-fn";
import type { IsChanged, IsValid, OmitFirstArg, Unsubscribe } from "./core";
import type { AnyStoreName } from "./name";
import type { ValidationFn } from "./validation-fn";
import type { ActionFn, ActionFnReturn, ActionInfo } from "./action";

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

export type StoreType<SomeStore extends AnyStore> = SomeStore extends AnyStore<
  infer Type
>
  ? Type
  : never;
export type StoresType<SomeStores extends AnyStores> = {
  [Name in keyof SomeStores]: StoreType<SomeStores[Name]>;
};

export const isNotReadOnlyStore = (store: AnyStore): store is Store<any> =>
  !store.isReadOnly;

export const isInnerStore = (store: AnyStore): store is InnerStore<any> =>
  isNotReadOnlyStore(store);
