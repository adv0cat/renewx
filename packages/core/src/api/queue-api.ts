import type { Unsubscribe } from "../types/core";
import type { ActionInfo } from "../types/action";
import type { Freeze } from "../types/freeze";
import type { ReadOnlyStore } from "../types/read-only-store";
import type { StoreID } from "../utils/id";
import type { Watcher } from "../types/watch";

type Notify<State> = (
  state: Freeze<State>,
  info?: ActionInfo,
  set?: boolean,
) => void;

const stores: Record<StoreID, Map<Watcher<any>, Unsubscribe>> = {};

let lastWatcher: Watcher<any> | undefined = undefined;
export const isNotLastWatcher = (v: Watcher<any>) =>
  lastWatcher !== v ? true : !!(lastWatcher = undefined);

let isQueueRunning = false;
let queue = [] as [any, StoreID, ActionInfo | undefined][];
const runQueue = (start = 0) => {
  isQueueRunning = true;
  const currentQueue = queue.slice(start);
  for (let i = currentQueue.length - 1; i >= 0; --i) {
    const [state, id, info] = currentQueue[i];
    const unsubscribes = stores[id];
    for (const [watcher, unsubscribe] of unsubscribes) {
      unsubscribe();
      lastWatcher = watcher;
      const newUnsubscribe = watcher(state, info) || (() => {});
      if (lastWatcher !== undefined) {
        unsubscribes.set(watcher, newUnsubscribe);
      } else {
        newUnsubscribe();
      }
    }
  }
  lastWatcher = undefined;

  const newStart = start + currentQueue.length;
  if (queue.length - newStart > 0) {
    runQueue(newStart);
    return;
  }
  queue = [];
  isQueueRunning = false;
};

export const getNotify =
  <State>(store: ReadOnlyStore<State>): Notify<State> =>
  (state: Freeze<State>, info?: ActionInfo, set = false): void => {
    const { id } = store;
    queue.push([
      state,
      id,
      info && {
        id: info.id,
        path: info.path.concat(id),
        set,
      },
    ]);
    if (!isQueueRunning) {
      runQueue();
    }
  };

export const getWatchers = <State>(
  id: StoreID,
): Map<Watcher<State>, Unsubscribe> =>
  (stores[id] ??= new Map<Watcher<State>, Unsubscribe>());
