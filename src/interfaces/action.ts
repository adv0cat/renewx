import type { Freeze } from "../utils/freeze";

export type ActionID = string | number | `${ string }.#set`

export type ActionFn<State> = (state: Freeze<State>, ...args: any[]) => State | Freeze<State>
export type ActionOptions = Partial<{ id: string | number }>
export type ActionInfo = { actionID: string | number }
