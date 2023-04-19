import type { ActionInfo } from "../interfaces/action";
import type { Listener, Store, StoreID, StoreOptions } from "../interfaces/store";
import { Freeze, freeze } from "../utils/freeze";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getStoreId } from "../utils/get-store-id";
import { ACTION, STORE } from "../inner/counters";

export const store = <State>(initState: State, { name }: StoreOptions = {}): Store<State> => {
    const storeID = getStoreId(name ?? STORE.newID())
    const listeners = [] as Listener<State>[]

    let state = freeze(initState)

    console.info(`[${ storeID }] created`)

    const notify = (info: ActionInfo) => {
        const _state = state
        listeners.forEach((listener) => listener(_state, info))
    }

    return {
        get: (): Freeze<State> => state,
        action: (action, { id } = {}) => {
            const actionID = id ?? ACTION.newID()
            return (...args) => {
                console.group(`[${ storeID }] ${ actionID }(${ getArgsForLog(args) })`)
                const newState = action(state, ...args)
                let isChanged = state !== newState
                isChanged
                    ? console.info("%c changed:", "color: #BDFF66", state, "->", newState)
                    : console.info("%c not changed", "color: #FF5E5B")
                if (isChanged) {
                    state = freeze(newState)
                }
                console.groupEnd()

                isChanged && notify({ actionID })
                return isChanged
            }
        },
        listen: (listener: Listener<State>) => {
            listeners.push(listener)
            return () => {
                listeners.splice(listeners.indexOf(listener), 1)
            }
        },
        id: (): StoreID => storeID
    } as Store<State>
}
