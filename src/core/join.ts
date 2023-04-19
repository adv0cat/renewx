import type { AnyStore, JoinStoreID, Listener, Store, StoreTypes } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { Unsubscribe } from "../interfaces/core";
import { concatStores } from "../utils/concat-stores";
import { Freeze, freeze } from "../utils/freeze";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getJoinStoreID } from "../utils/get-join-store-id";
import { getInnerSetActionID } from "../utils/get-inner-set-action-id";
import { ACTION } from "../inner/counters";

export const join = <Store1 extends AnyStore, Store2 extends AnyStore, Stores extends AnyStore[], R extends [...StoreTypes<[Store1, Store2, ...Stores]>]>(store1: Store1, store2: Store2, ...otherStores: Stores): Store<R> => {
    const stores = concatStores(store1, store2, otherStores)
    const storeID = getJoinStoreID(stores)
    const listeners = [] as Listener<R>[]

    let states = freeze(stores.map((store) => store.get()) as R)

    console.info(`[${ storeID }] created <-`, JSON.stringify(stores.map((store) => store.id())))

    const notify = (info: ActionInfo) => {
        const _states = states
        listeners.forEach((listener) => listener(_states, info))
    }

    // TODO: destroy join store and run unsubscribes
    const unsubscribes = stores.reduce((result, store) => {
        const actionID = getInnerSetActionID(store)
        if (result[actionID] === undefined) {
            result[actionID] = store.listen((_, info) => info.actionID !== actionID && notify(info))
        }
        return result
    }, {} as Record<string, Unsubscribe>)

    const actions = stores.map((store) => {
        return store.action((_, value) => value, { id: getInnerSetActionID(store) })
    })

    return {
        get: (): Freeze<R> => states,
        action: (action, { id } = {}) => {
            const actionID = id ?? ACTION.newID()
            return (...args) => {
                console.group(`[${ storeID }] ${ actionID }(${ getArgsForLog(args) })`)
                const newStates = action(states, ...args)
                let isChanged = false
                if (states !== newStates) {
                    newStates.forEach((newState, index) => {
                        if (actions[index]?.(newState)) {
                            isChanged = true
                        }
                    })
                }
                isChanged
                    ? console.info("%c changed:", "color: #BDFF66", states, "->", newStates)
                    : console.info("%c not changed", "color: #FF5E5B")
                if (isChanged) {
                    states = freeze(newStates)
                }
                console.groupEnd()

                isChanged && notify({ actionID })
                return isChanged
            }
        },
        listen: (listener: Listener<R>) => {
            listeners.push(listener)
            return () => {
                listeners.splice(listeners.indexOf(listener), 1)
            }
        },
        id: (): JoinStoreID => storeID
    } as Store<R>
}
