import type { AnyActionStore } from "../types/any-store";
import type { Actions, ActionsFn, StoreActions } from "../types/actions";

export const actions = <
  Store extends AnyActionStore,
  SomeActionsFn extends ActionsFn<Store>,
>(
  store: Store,
  actions: SomeActionsFn,
): Actions<Store, SomeActionsFn> & StoreActions<Store> =>
  Object.keys(actions).reduce(
    (result, key: keyof Actions<Store, SomeActionsFn>) => {
      result[key] = store.newAction(actions[key], key as string);
      return result;
    },
    { store, set: store.set } as Actions<Store, SomeActionsFn>,
  ) as Actions<Store, SomeActionsFn> & StoreActions<Store>;
