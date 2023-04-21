import type { ActionFn, ActionInfo, ActionOptions } from "./action";
import type { IsChanged, OmitFirstArg, Unsubscribe } from "./core";
import type { Freeze } from "../utils/freeze";

export type StoreID = `[${ number | string }]`
export type JoinStoreID = `<${ string }>`

export type Listener<State> = (state: Freeze<State>, info: ActionInfo) => Unsubscribe | void
export type Notify<State> = (state: Freeze<State>, info: ActionInfo) => void

export type StoreOptions = Partial<{ name: string }>
export type Store<State> = {
    get(): Freeze<State>,
    action<NewActionFn extends ActionFn<State>>(action: NewActionFn, options?: ActionOptions): (...args: OmitFirstArg<NewActionFn>) => IsChanged,
    watch(cb: Listener<State>): Unsubscribe
    id(): StoreID | JoinStoreID
}
export type AnyStore<State = any> = Store<State>

export type StoreType<SomeStore extends AnyStore> = SomeStore extends Store<infer Type> ? Type : never
export type StoreTypes<SomeStores extends AnyStore[]> = {
    [Index in keyof SomeStores]: StoreType<SomeStores[Index]>
}
