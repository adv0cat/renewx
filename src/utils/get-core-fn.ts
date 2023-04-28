import type { Listener, ReadOnlyStore, Notify } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { Freeze } from "./freeze";
import type { Unsubscribe } from "../interfaces/core";

let isQueueRunning = false;
let queue = [] as [any, ActionInfo, Map<Listener<any>, Unsubscribe | void>][];

const runQueue = (start = 0) => {
  isQueueRunning = true;
  const currentQueue = queue.slice(start);
  for (let i = currentQueue.length - 1; i >= 0; --i) {
    const [state, info, unsubscribes] = currentQueue[i];
    for (const [listener, unsubscribe] of unsubscribes) {
      unsubscribe?.();
      unsubscribes.set(listener, listener(state, info));
    }
  }
  const newStart = start + currentQueue.length;
  if (queue.length - newStart > 0) {
    runQueue(newStart);
    return;
  }
  queue = [];
  isQueueRunning = false;
};

export const getCoreFn = <State>(
  get: ReadOnlyStore<State>["get"],
  id: ReadOnlyStore<State>["id"]
): [
  ReadOnlyStore<State>["get"],
  ReadOnlyStore<State>["id"],
  ReadOnlyStore<State>["watch"],
  Notify<State>
] => {
  const unsubscribes = new Map<Listener<State>, Unsubscribe | void>();
  return [
    get,
    id,
    (listener): Unsubscribe => {
      unsubscribes.set(listener, listener(get(), { actionID: "init" }));
      return () => {
        unsubscribes.get(listener)?.();
        unsubscribes.delete(listener);
      };
    },
    (state: Freeze<State>, info: ActionInfo): void => {
      queue.push([state, info, unsubscribes]);
      if (!isQueueRunning) {
        runQueue();
      }
    },
  ];
};
