import type {
    AnyStores,
    JoinStoreID,
    Store,
    StoresType,
    StoresActions,
} from "../interfaces/store";
import type { Unsubscribe } from "../interfaces/core";
import type { ActionID, ActionOptions } from "../interfaces/action";
import { ACTION } from "./action";
import { freeze } from "../utils/freeze";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getCoreFnList } from "../utils/get-core-fn-list";
import { isNotReadOnlyStore } from "../utils/is-not-read-only-store";

export const join = <
    Stores extends AnyStores,
    R extends StoresType<Stores>
>(stores: Stores): Store<R> => {
    const storesNameList = Object.keys(stores) as (keyof Stores)[]
    const storesNameListLength = storesNameList.length
    const getStates = () => {
        const states = {} as R
        for (let i = 0; i < storesNameListLength; i++) {
            const storeName = storesNameList[i]
            states[storeName] = stores[storeName].get()
        }
        return freeze<R>(states)
    }
    let states = getStates()

    const storeID: JoinStoreID = `{${ storesNameList.reduce<string>(
        (resultName, storeName, i) => i > 0
            ? `${ resultName };${ stores[storeName].id() }`
            : stores[storeName].id(),
        ""
    ) }}`

    const [get, id, watch, notify] = getCoreFnList(
        () => states,
        () => storeID
    )

    console.info(`[${ storeID }] created`)

    const unsubscribes: Record<string, Unsubscribe> = {}
    const actions = storesNameList.reduce((result, storeName) => {
        const store = stores[storeName]
        const actionID: ActionID = `${ store.id() }.#set`
        const options: ActionOptions = { id: actionID }
        if (!(actionID in unsubscribes)) {
            unsubscribes[actionID] = store.watch((_, info) => {
                info.actionID !== actionID && notify(states, info)
            })
            if (isNotReadOnlyStore(store)) {
                result[storeName as keyof StoresActions<Stores>] = store
                    .action((_, value) => value, options) as StoresActions<Stores>[keyof StoresActions<Stores>]
            }
        }
        return result
    }, {} as StoresActions<Stores>)
    const actionsNameList = storesNameList.filter((key) => key in actions) as (keyof StoresActions<Stores>)[]

    return {
        isReadOnly: false,
        id,
        get,
        watch,
        action: (action, { id } = {}) => {
            const actionID = id ?? ACTION.newID()
            return (...args) => {
                console.group(`[${ storeID }] ${ actionID }(${ getArgsForLog(args) })`)
                const actionStates = action(states, ...args)
                if (states !== actionStates) {
                    if (actionsNameList.some((storeName) => storeName in actionStates
                        ? actions[storeName](actionStates[storeName])
                        : false
                    )) {
                        const newStates = getStates()
                        console.info("%c changed:", "color: #BDFF66", states, "->", newStates)
                        states = newStates
                        notify(states, { actionID })
                        console.groupEnd()
                        return true
                    }
                }
                console.info("%c not changed", "color: #FF5E5B")
                console.groupEnd()
            }
        },
    } as Store<R>
}
