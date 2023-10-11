import type { Store } from "./types/store";
import { saveStore } from "./api/store-api";
import type { StoreTag } from "./types/tag";
import type { Freeze } from "./types/freeze";
import type { StoreName } from "./types/name";
import type { Config } from "./types/config";
import { readOnlyStore } from "./read-only-store";
import { actionStore } from "./action-store";
import { mergeConfig } from "./main-config";

export const store = <State>(
  initState: State,
  storeName: string = "",
  config: Partial<Config> = {},
): Store<State> =>
  saveStore(
    actionStore<State, StoreTag>(
      readOnlyStore(
        initState as Freeze<State>,
        storeName,
        (storeID): StoreName => `${storeID}`,
        "rs",
      ),
      mergeConfig(config),
    ),
  );
