import type { OmitFirstArg } from "../types/core";
import type { AnyStore } from "../types/any-store";
import { allStates, getProcess, Process } from "../api/new-state-api";
import type { WritableTag } from "../types/tag";
import { isActionStore } from "./is";
import { getDeepAdjacencyList } from "../api/directed-acyclic-graph";
import { getUnWatchList, notify, runQueue } from "../api/queue-api";
import { getSetInfo } from "../api/action-api";
import type { ReadOnlyTxState, TxFn, TxState, TxStates } from "../types/tx";

export const tx = <
  Stores extends AnyStore[],
  SomeTxFn extends TxFn<Stores>,
  ToState extends Awaited<ReturnType<SomeTxFn>>,
>(
  stores: [...Stores],
  txFn: SomeTxFn,
): ((...args: OmitFirstArg<SomeTxFn>) => Promise<ToState>) => {
  let ids = [] as number[];
  let processList = [] as Process[][];

  for (const store of stores) {
    const { id } = store;
    const deepAdjacencyList = getDeepAdjacencyList(id);

    ids = ids.concat(id, deepAdjacencyList);
    processList[id] = deepAdjacencyList.map(getProcess) as Process[];
  }

  ids = [...new Set(ids)].sort();

  return async (...args) => {
    let error;
    let newStates = [] as any[];

    const snapshot = allStates.slice(0);
    for (const storeId of ids) {
      newStates[storeId] = snapshot[storeId];
    }

    const txStates = stores.map((store) => {
      const { id } = store;
      const get = () => newStates[id];
      return isActionStore(store)
        ? ({
            get,
            unsafe: get,
            set: (newState) => {
              if (store.canSet(newState)) {
                newStates[id] = newState;
                for (const process of processList[id]) {
                  process(newStates);
                }
              }
            },
          } as TxState<any, WritableTag>)
        : ({ get, unsafe: get } as ReadOnlyTxState<any>);
    }) as TxStates<Stores>;

    try {
      const result = await txFn(txStates, ...args);

      // Optimistic Concurrency Control (OCC)
      if (
        ids.every((id) => {
          const firstState = snapshot[id];
          return (
            Object.is(firstState, allStates[id]) ||
            Object.is(firstState, newStates[id])
          );
        })
      ) {
        Object.assign(allStates, newStates);
        newStates = [];

        const info = getSetInfo();
        for (const storeId of ids) {
          notify(
            allStates[storeId],
            getUnWatchList(storeId),
            info && {
              id: info.id,
              path: info.path.concat(storeId),
            },
          );
        }

        runQueue();

        return result;
      } else {
        error = Error("Commit failed due to state changes");
      }
    } catch (e) {
      error = e;
    }

    newStates = [];
    throw error;
  };
};
