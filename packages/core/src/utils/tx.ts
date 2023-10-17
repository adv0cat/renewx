import type { Freeze, MaybeFreeze } from "../types/freeze";
import type { OmitFirstArg } from "../types/core";
import type { AnyStore } from "../types/any-store";
import { allStates, getProcess } from "../api/new-state-api";
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
  const snapshot = allStates.slice(0);
  const txStates = [] as ReadOnlyTxState<any>[];

  let ids = [] as number[];
  let newStates = [] as any[];

  for (const store of stores) {
    const { id } = store;
    const deepAdjacencyList = getDeepAdjacencyList(id);
    const processList = deepAdjacencyList.map(getProcess);

    ids = ids.concat(id, deepAdjacencyList);

    const get = (): Freeze<any> => newStates[id];
    const set = (v: MaybeFreeze<any>): void => {
      newStates[id] = v;
      for (const process of processList) {
        process(newStates);
      }
    };

    txStates.push(
      isActionStore(store)
        ? ({ get, set } as TxState<any, WritableTag>)
        : ({ get } as ReadOnlyTxState<any>),
    );
  }

  ids = [...new Set(ids)].sort();
  for (const storeId of ids) {
    newStates[storeId] = snapshot[storeId];
  }

  return async (...args) => {
    let error;
    try {
      const result = await txFn(txStates as TxStates<Stores>, ...args);

      if (
        ids.every(
          (id) =>
            Object.is(snapshot[id], allStates[id]) ||
            Object.is(snapshot[id], newStates[id]),
        )
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
