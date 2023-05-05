import type { Listener, ReadOnlyStore, Notify } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { Freeze } from "./freeze";
import type { Unsubscribe } from "../interfaces/core";
import type { AnyStoreName, StoreID } from "../interfaces/id";
import type { StoreOptions } from "../interfaces/store";
import { StoreInnerAPI } from "../core/store-api";
import { nextStoreId } from "./id";

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
  get: ReadOnlyStore<State>["get"],
  name: (storeID: StoreID) => AnyStoreName,
  options: StoreOptions
): [
  ReadOnlyStore<State>["id"],
  ReadOnlyStore<State>["get"],
  ReadOnlyStore<State>["name"],
  ReadOnlyStore<State>["watch"],
  Notify<State>
] => {
  const storeID = nextStoreId();
  let storeName: AnyStoreName = "";
  const unsubscribes = new Map<Listener<State>, Unsubscribe | void>();
  return [
    storeID,
    get,
    (): AnyStoreName => {
      if (storeName.length === 0) {
        storeName = options.name ?? name(storeID);
      }
      return storeName;
    },
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
