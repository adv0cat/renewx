import type { ActionFn, ActionInfo, ActionOptions } from "./action";
import type { IsChanged, OmitFirstArg, Unsubscribe } from "./core";
import type { Freeze } from "../utils/freeze";

export type StoreID = `store-${ number }` | `${ string }Store`
export type JoinStoreID = `<${ string }>JoinStore`

export type Listener<State> = (state: Freeze<State>, info: ActionInfo) => void
export type StoreOptions = Partial<{ name: string }>
export type Store<State> = {
    get<FreezeState extends Freeze<State>>(): FreezeState,
    action<NewActionFn extends ActionFn<State>>(action: NewActionFn, options?: ActionOptions): (...args: OmitFirstArg<NewActionFn>) => IsChanged,
    listen<FreezeState extends Freeze<State>>(cb: (state: FreezeState, info: ActionInfo) => void): Unsubscribe
    id(): StoreID | JoinStoreID
}
export type AnyStore<State = any> = Store<State>

export type StoreType<SomeStore extends AnyStore> = SomeStore extends Store<infer Type> ? Type : never
export type StoreTypes<SomeStores extends AnyStore[]> = {
    [Index in keyof SomeStores]: StoreType<SomeStores[Index]>
}
