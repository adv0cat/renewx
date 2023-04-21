import type { AnyStore, JoinStoreID, Listener, Store, StoreTypes } from "../interfaces/store";
import type { Unsubscribe } from "../interfaces/core";
import { type Freeze, freeze } from "../utils/freeze";
import { ACTION } from "./action";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getCoreFnList } from "../utils/get-core-fn-list";
import { ActionID } from "../interfaces/action";

export const join = <Store1 extends AnyStore, Store2 extends AnyStore, Stores extends AnyStore[], R extends [...StoreTypes<[Store1, Store2, ...Stores]>]>(store1: Store1, store2: Store2, ...otherStores: Stores): Store<R> => {
    const stores = ([store1, store2] as AnyStore[]).concat(otherStores)
    let states = freeze(stores.map((store) => store.get()) as R)

    const [watch, notify] = getCoreFnList([] as Listener<R>[])
    const storeID: JoinStoreID = `<${ stores
        .map((store) => store.id())
        .join(";") }>`

    console.info(`[${ storeID }] created`)

    const unsubscribes: Record<string, Unsubscribe> = {}
    const actions = stores.map((store) => {
        const actionID: ActionID = `${ store.id() }.#set`
        if (actionID in unsubscribes) {
            unsubscribes[actionID] = store.watch((_, info) => info.actionID !== actionID && notify(states, info))
        }
        return store.action((_, value) => value, { id: actionID })
    })

    return {
        watch,
        id: (): JoinStoreID => storeID,
        get: (): Freeze<R> => states,
        action: (action, { id } = {}) => {
            const actionID = id ?? ACTION.newID()
            return (...args) => {
                console.group(`[${ storeID }] ${ actionID }(${ getArgsForLog(args) })`)
                const newStates = action(states, ...args)
                if (states !== newStates) {
                    if (newStates.some((newState, index) => actions[index]?.(newState))) {
                        console.info("%c changed:", "color: #BDFF66", states, "->", newStates)
                        states = freeze(newStates)
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
