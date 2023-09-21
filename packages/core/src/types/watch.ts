import type { Freeze } from "./freeze";
import type { AnyStore, AnyStoresStates, AnyStoreState } from "./any-store";
import type { Config } from "./config";
import type { Unsubscribe } from "./core";
import type { ActionInfo } from "./action";

export interface Watch {
  <Stores extends AnyStore[]>(
    stores: [...Stores],
    watcher: Watcher<[...AnyStoresStates<Stores>]>,
    config?: Partial<Config>,
  ): Unsubscribe;

  <Store extends AnyStore>(
    store: Store,
    watcher: Watcher<AnyStoreState<Store>>,
    config?: Partial<Config>,
  ): Unsubscribe;
}

export type Watcher<State> = (
  state: Freeze<State>,
  info?: ActionInfo,
) => Unsubscribe | void;
