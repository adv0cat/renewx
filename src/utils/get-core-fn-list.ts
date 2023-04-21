import type { Listener, Store, Notify } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { Freeze } from "./freeze";

export const getCoreFnList = <State>(
    get: Store<State>['get'],
    id: Store<State>['id'],
): [Store<State>['get'], Store<State>['id'], Store<State>['watch'], Notify<State>] => {
    const listeners = [] as Listener<State>[]
    return [
        get,
        id,
        (listener) => {
            listeners.push(listener)
            listener(get(), { actionID: 'init' })
            return () => listeners.splice(listeners.indexOf(listener), 1)[0]?.(get(), { actionID: `${ id() }.#off` })
        },
        (state: Freeze<State>, info: ActionInfo): void => listeners.forEach((listener) => listener(state, info)?.()),
    ]
}
