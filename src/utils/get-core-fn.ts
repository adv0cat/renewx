import type { Listener, ReadOnlyStore, Notify } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { Freeze } from "./freeze";
import type { Unsubscribe } from "../interfaces/core";

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
      for (const [listener, unsubscribe] of unsubscribes) {
        unsubscribe?.();
        unsubscribes.set(listener, listener(state, info));
      }
    },
  ];
};
