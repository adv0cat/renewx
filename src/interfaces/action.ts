import type { Freeze } from "../utils/freeze";
import type { AnyStores, StoresType } from "./store";
import type { KeysOfStores } from "./core";

export type ActionID = string | number | 'init' | `${ string }.#${ 'set' | 'off' }`

export type ActionFn<State> = (
    state: Freeze<State>,
    ...args: any[]
) => ActionFnReturn<State>

export type ActionFnReturn<State> = State extends StoresType<infer SomeStores extends AnyStores>
    ? KeysOfStores<SomeStores> extends never
        ? State | Freeze<State>
        : Partial<Pick<State, KeysOfStores<SomeStores>>> | undefined
    : State | Freeze<State>

export type AdapterAction<FromState, ToState> = (state: Freeze<FromState>) => ToState

export type ActionOptions = Partial<{ id: string | number }>
export type ActionInfo = { actionID: string | number }
