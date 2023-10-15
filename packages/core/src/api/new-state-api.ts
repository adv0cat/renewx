import type { ReadOnlyStore } from "../types/read-only-store";
import { isStateChanged } from "../utils/is";
import type { Config } from "../types/config";
import { getDeepAdjacencyList } from "./directed-acyclic-graph";
import type { StoreID } from "../types/id";
import type { Freeze } from "../types/freeze";
import type { ActionInfo } from "../types/action";
import { getUnWatchList, notify, runQueue } from "./queue-api";

type Process = (states: any[]) => void;
const processList: Process[] = [];

export const allStates: any[] = [];

export const setNewState = <State>(
  primaryId: StoreID,
  newState: Freeze<State>,
  info?: ActionInfo,
): boolean => {
  notify(
    (allStates[primaryId] = newState),
    getUnWatchList<any>(primaryId),
    (info &&= {
      id: info.id,
      path: info.path.concat(primaryId),
    }),
  );

  for (const storeId of getDeepAdjacencyList(primaryId)) {
    processList[storeId](allStates);

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
  return true;
};

/**
 * Defines a new state for a store based on dependencies to other stores.
 * @param store - The store for which a new state is being calculated.
 * @param dependsOn - An array of StoreIDs representing the stores this store depends on.
 * @param getNewState - A function that returns a new state. The order of states is the same as the array of stores it dependsOn.
 * @param config - Configuration options for the state addition.
 */
export const addProcessNewState = <ToState>(
  store: ReadOnlyStore<ToState>,
  dependsOn: StoreID[],
  getNewState: (states: any[]) => Freeze<ToState>,
  config: Config,
) => {
  const { stateCheck } = config;
  const { id } = store;

  let index = 0;
  const buffer = new Array(dependsOn.length);

  processList[id] = (states) => {
    if (!store.isOff) {
      index = 0;
      for (const storeId of dependsOn) {
        buffer[index++] = states[storeId];
      }

      const newState = getNewState(buffer);
      if (!stateCheck || isStateChanged(states[id], newState)) {
        states[id] = newState;
      }
    }
  };
};
