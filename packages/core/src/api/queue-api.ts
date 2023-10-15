import type { Unsubscribe } from "../types/core";
import type { ActionInfo } from "../types/action";
import type { StoreID } from "../types/id";
import type { Watcher } from "../types/watch";

const watchers: Record<StoreID, Map<Watcher<any>, Unsubscribe>> = {};

let batching = false;
export const batchQueueStart = () => (batching = true);
export const batchQueueEnd = () => {
  batching = false;
  runQueue();
};

const noop = () => {};
export const getFn = (fn: any): Unsubscribe =>
  typeof fn === "function" ? fn : noop;

let watcherInQueue: any;
export const globalUnWatch = (watcher: Watcher<any>): true =>
  watcherInQueue !== watcher || !(watcherInQueue = 0); // We always need to return true

/**
 * queue[i] - state: any
 * queue[i + 1] - unWatchList: Map<Watcher<any>, Unsubscribe>
 * queue[i + 2] - info?: ActionInfo
 */
let queue = [] as any[];
let queueIndex = 0;
let queueLength = 0;
let isQueueRunning = false;
let newUnWatch: Unsubscribe;

export const runQueue = (): void => {
  if (isQueueRunning || batching) {
    return;
  }
  isQueueRunning = true;

  for (; queueIndex < queueLength; queueIndex += 3) {
    const unWatchList = queue[queueIndex + 1];
    for (const [watcher, unWatch] of unWatchList) {
      watcherInQueue = watcher;
      try {
        unWatch();
        newUnWatch = getFn(watcher(queue[queueIndex], queue[queueIndex + 2]));
        if (watcherInQueue === watcher) {
          unWatchList.set(watcher, newUnWatch);
        } else {
          newUnWatch();
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  queue = [];
  queueIndex = 0;
  queueLength = 0;
  watcherInQueue = 0;
  isQueueRunning = false;
};

export const notify = (
  state: any,
  unWatchList: Map<Watcher<any>, Unsubscribe>,
  info?: ActionInfo,
) => {
  if (unWatchList.size !== 0) {
    let index = 0;
    if (batching && ~(index = queue.indexOf(unWatchList, queueIndex))) {
      queue[index - 1] = state;
      queue[index + 1] = info;
    } else {
      queueLength = queue.push(state, unWatchList, info);
    }
  }
};

export const getUnWatchList = <State>(
  id: StoreID,
): Map<Watcher<State>, Unsubscribe> =>
  (watchers[id] ??= new Map<Watcher<State>, Unsubscribe>());
