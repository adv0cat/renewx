import type { AnyActionStore } from "../types/any-store";
import type { Actions, ActionsFn } from "../types/actions";

export const actions = <
  Store extends AnyActionStore,
  SomeActionsFn extends ActionsFn<Store>,
>(
  store: Store,
  actions: SomeActionsFn,
): Actions<Store, SomeActionsFn> & { store: Store } =>
  Object.keys(actions).reduce(
    (result, key: keyof Actions<Store, SomeActionsFn>) => {
      result[key] = store.newAction(actions[key], key as string);
      return result;
    },
    { store } as Actions<Store, SomeActionsFn>,
  ) as Actions<Store, SomeActionsFn> & { store: Store };
