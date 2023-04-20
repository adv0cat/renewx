import type { Listener } from "../interfaces/store";
import type { Unsubscribe } from "../interfaces/core";
import type { ActionInfo } from "../interfaces/action";
import type { Freeze } from "./freeze";

export const getCoreFnList = <State>(listeners: Listener<State>[]): [(listener: Listener<State>) => Unsubscribe, (state: Freeze<State>, info: ActionInfo) => void] => [
    (listener: Listener<State>): Unsubscribe => {
        listeners.push(listener)
        // TODO: get from listener unsubscribe
        return () => listeners.splice(listeners.indexOf(listener), 1)
    },
    (state: Freeze<State>, info: ActionInfo): void => listeners.forEach((listener) => listener(state, info)),
]
