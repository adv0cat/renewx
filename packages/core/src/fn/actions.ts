import type { AnyActionStore } from "../types/any-store";
import type { Actions, StoreActions } from "../types/actions";
import type { Action, ActionFn } from "../types/action";
import { newActionInfo } from "../api/action-api";
import { allStates } from "../api/new-state-api";

export const action: Action = (store, fn, name) => {
  const info = newActionInfo(name);
  const { id, set } = store;
  return (...v) => !(store.isOff || !set(fn(allStates[id], ...v), info));
};

export const actions = <
  Store extends AnyActionStore,
  ActionsFn extends Record<string, ActionFn<Store>>,
>(
  store: Store,
  actions: ActionsFn,
): Actions<Store, ActionsFn> & StoreActions<Store> =>
  Object.keys(actions).reduce(
    (result, key: keyof Actions<Store, ActionsFn>) => {
      result[key] = action(store, actions[key], key as string);
      return result;
    },
    { store, set: store.set } as Actions<Store, ActionsFn>,
  ) as Actions<Store, ActionsFn> & StoreActions<Store>;
