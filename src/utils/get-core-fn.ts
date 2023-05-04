import type { Listener, ReadOnlyStore, Notify } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { Freeze } from "./freeze";
import type { Unsubscribe } from "../interfaces/core";
import { StoreInnerAPI } from "../core/store-api";

let isQueueRunning = false;
let queue = [] as [
  any,
  Map<Listener<any>, Unsubscribe | void>,
  ActionInfo | undefined
][];

const runQueue = (start = 0) => {
  isQueueRunning = true;
  const currentQueue = queue.slice(start);
  for (let i = currentQueue.length - 1; i >= 0; --i) {
    const [state, unsubscribes, info] = currentQueue[i];
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
  id: ReadOnlyStore<State>["id"],
  name: ReadOnlyStore<State>["name"],
  get: ReadOnlyStore<State>["get"]
): [
  ReadOnlyStore<State>["id"],
  ReadOnlyStore<State>["name"],
  ReadOnlyStore<State>["get"],
  ReadOnlyStore<State>["watch"],
  Notify<State>
] => {
  const storeID = id();
  const unsubscribes = new Map<Listener<State>, Unsubscribe | void>();
  return [
    id,
    name,
    get,
    (listener): Unsubscribe => {
      unsubscribes.set(
        listener,
        listener(
          get(),
          StoreInnerAPI.addActionInfo
            ? { actionID: "#init", from: [storeID] }
            : undefined
        )
      );
      return () => {
        unsubscribes.get(listener)?.();
        unsubscribes.delete(listener);
      };
    },
    (state: Freeze<State>, info?: ActionInfo): void => {
      queue.push([state, unsubscribes, info]);
      if (!isQueueRunning) {
        runQueue();
      }
    },
  ];
};
