import type { AdapterStoreID, Store, StoreOptions, ReadOnlyStore } from "../interfaces/store";
import type { AdapterAction } from "../interfaces/action";
import { freeze } from "../utils/freeze";
import { getIDCounter } from "../utils/get-id-counter";
import { getCoreFnList } from "../utils/get-core-fn-list";

const ADAPTER_STORE = getIDCounter()

export const adapter = <FromState, ToState>(
    store: Store<FromState> | ReadOnlyStore<FromState>,
    adapterAction: AdapterAction<FromState, ToState>,
    { name }: StoreOptions = {}
): ReadOnlyStore<ToState> => {
    let fromState = store.get()
    let state = freeze(adapterAction(fromState))
    const storeID: AdapterStoreID = `(${ store.id() }=>${ name ?? ADAPTER_STORE.newID() })`

    const [get, id, watch, notify] = getCoreFnList(
        () => state,
        () => storeID
    )

    console.info(`${ storeID } created`)

    const unsubscribe = store.watch((_fromState, info) => {
        fromState = _fromState
        state = freeze(adapterAction(fromState))
        notify(state, info)
    })

    return {
        isReadOnly: true,
        id,
        get,
        watch,
    } as ReadOnlyStore<ToState>
}
