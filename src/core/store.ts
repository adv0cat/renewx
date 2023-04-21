import type { Store, StoreID, StoreOptions } from "../interfaces/store";
import { ACTION } from "./action";
import { freeze } from "../utils/freeze";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getIDCounter } from "../utils/get-id-counter";
import { getCoreFnList } from "../utils/get-core-fn-list";

const STORE = getIDCounter()

export const store = <State>(initState: State, { name }: StoreOptions = {}): Store<State> => {
    let state = freeze(initState)
    const storeID: StoreID = `[${ name ?? STORE.newID() }]`

    const [get, id, watch, notify] = getCoreFnList(
        () => state,
        () => storeID
    )

    console.info(`[${ storeID }] created`)

    return {
        watch,
        id,
        get,
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
