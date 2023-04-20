import type { Listener, Store, StoreID, StoreOptions } from "../interfaces/store";
import { type Freeze, freeze } from "../utils/freeze";
import { ACTION } from "./action";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getIDCounter } from "../utils/get-id-counter";
import { getCoreFnList } from "../utils/get-core-fn-list";

const STORE = getIDCounter()

export const store = <State>(initState: State, { name }: StoreOptions = {}): Store<State> => {
    let state = freeze(initState)

    const [listen, notify] = getCoreFnList([] as Listener<State>[])
    const storeID: StoreID = `[${ name ?? STORE.newID() }]`

    console.info(`[${ storeID }] created`)

    return {
        listen,
        id: (): StoreID => storeID,
        get: (): Freeze<State> => state,
        action: (action, { id } = {}) => {
            const actionID = id ?? ACTION.newID()
            return (...args) => {
                console.group(`[${ storeID }] ${ actionID }(${ getArgsForLog(args) })`)
                const newState = action(state, ...args)
                if (state !== newState) {
                    console.info("%c changed:", "color: #BDFF66", state, "->", newState)
                    state = freeze(newState)
                    notify(state, { actionID })
                    console.groupEnd()
                    return true
                }
                console.info("%c not changed", "color: #FF5E5B")
                console.groupEnd()
            }
        },
    } as Store<State>
}
