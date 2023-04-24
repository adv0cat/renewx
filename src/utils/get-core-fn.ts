import type { Listener, ReadOnlyStore, Notify } from "../interfaces/store";
import type { ActionInfo } from "../interfaces/action";
import type { Freeze } from "./freeze";

export const getCoreFn = <State>(
  get: ReadOnlyStore<State>["get"],
  id: ReadOnlyStore<State>["id"]
): [
  ReadOnlyStore<State>["get"],
  ReadOnlyStore<State>["id"],
  ReadOnlyStore<State>["watch"],
  Notify<State>
] => {
  const listeners = [] as Listener<State>[];
  return [
    get,
    id,
    (listener) => {
      listeners.push(listener);
      listener(get(), { actionID: "init" });
      return () =>
        listeners.splice(listeners.indexOf(listener), 1)[0]?.(get(), {
          actionID: `${id()}.#off`,
        });
    },
    (state: Freeze<State>, info: ActionInfo): void =>
      listeners.forEach((listener) => listener(state, info)?.()),
  ];
};
