import type { Unsubscribe } from "../types/core";
import type { ActionInfo } from "../types/action";
import type { StoreID } from "../types/id";
import type { Watcher } from "../types/watch";

const watchers: Record<StoreID, Map<Watcher<any>, Unsubscribe>> = {};

let lastWatcher: Watcher<any> | undefined = undefined;
export const isNotLastWatcher = (v: Watcher<any>) =>
  lastWatcher !== v || (lastWatcher = undefined);

const noop = () => {};
export const getFn = (fn: any): Unsubscribe =>
  typeof fn === "function" ? fn : noop;

/**
 * queue[i] - state: any
 * queue[i + 1] - unWatchList: Map<Watcher<any>, Unsubscribe>
 * queue[i + 2] - info?: ActionInfo
 */
let queue = [] as any[];
let queueStart = 0;
let queueLength = 0;
let isQueueRunning = false;

export const runQueue = (isInsideRun = false): void => {

  if (!isInsideRun && isQueueRunning) {
    return;
  }
  isQueueRunning = true;

  const queueEnd = queue.length;
  for (let i = queueStart; i < queueEnd; i += 3) {
    const unWatchList = queue[i + 1];
    for (const [watcher, unWatch] of unWatchList) {
      unWatch();
      lastWatcher = watcher;
      const newUnWatch = getFn(watcher(queue[i], queue[i + 2]));
      if (lastWatcher !== undefined) {
        unWatchList.set(watcher, newUnWatch);
      } else {
        newUnWatch();
      }
    }
  }
  lastWatcher = undefined;

  if (queueLength - (queueStart = queueEnd) > 0) {
    return runQueue(true);
  }
  queue = [];
  queueStart = 0;
  queueLength = 0;
  isQueueRunning = false;
};

export const notify = (
  state: any,
  unWatchList: Map<Watcher<any>, Unsubscribe>,
  info?: ActionInfo,
) => {
  if (unWatchList.size !== 0) {
    queueLength = queue.push(state, unWatchList, info);
  }
};

export const getUnWatchList = <State>(
  id: StoreID,
): Map<Watcher<State>, Unsubscribe> =>
  (watchers[id] ??= new Map<Watcher<State>, Unsubscribe>());
