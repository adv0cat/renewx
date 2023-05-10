import type { Watcher, ReadOnlyStore, Notify } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { Freeze } from "./freeze";
import type { Unsubscribe } from "../interfaces/core";
import type { AnyStoreName, StoreID } from "../interfaces/id";
import { ActionInnerAPI } from "../core/action-api";
import { nextStoreId } from "./id";

let isQueueRunning = false;
let queue = [] as [
  any,
  Map<Watcher<any>, Unsubscribe>,
  ActionInfo | undefined
][];

const noop = () => void 0;
const getUnsubscribe = (unsubscribe: any): Unsubscribe =>
  typeof unsubscribe === "function" ? unsubscribe : noop;

const runQueue = (start = 0) => {
  isQueueRunning = true;
  const currentQueue = queue.slice(start);
  for (let i = currentQueue.length - 1; i >= 0; --i) {
    const [state, unsubscribes, info] = currentQueue[i];
    for (const [watcher, unsubscribe] of unsubscribes) {
      unsubscribe();
      unsubscribes.set(watcher, getUnsubscribe(watcher(state, info)));
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
  storeName: string,
  get: ReadOnlyStore<State>["get"],
  name: (storeID: StoreID) => AnyStoreName
): [
  ReadOnlyStore<State>["id"],
  ReadOnlyStore<State>["get"],
  ReadOnlyStore<State>["name"],
  ReadOnlyStore<State>["watch"],
  Notify<State>
] => {
  const storeID = nextStoreId();
  const unsubscribes = new Map<Watcher<State>, Unsubscribe>();
  return [
    storeID,
    get,
    (): AnyStoreName => (storeName ||= name(storeID)),
    (watcher): Unsubscribe => {
      unsubscribes.set(
        watcher,
        getUnsubscribe(
          watcher(
            get(),
            ActionInnerAPI.addInfo ? { id: -1, path: [storeID] } : undefined
          )
        )
      );
      return () => {
        getUnsubscribe(unsubscribes.get(watcher))();
        unsubscribes.delete(watcher);
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
