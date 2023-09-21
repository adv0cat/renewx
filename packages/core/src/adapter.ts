import { isStateChanged } from "./utils/is";
import type { AnyStore } from "./types/any-store";
import type { Adapter } from "./types/adapter";
import type { AdapterTag } from "./types/tag";
import type { Freeze } from "./types/freeze";
import type { AdapterStoreName } from "./types/name";
import type { Config } from "./types/config";
import { configMerge } from "./types/config";
import type { ReadOnlyStore } from "./types/read-only-store";
import { readOnlyStore } from "./read-only-store";
import { getNotify } from "./api/queue-api";
import { saveStore } from "./api/store-api";
import { watch } from "./fn/watch";

export const adapter: Adapter = <ToState>(
  stores: AnyStore | AnyStore[],
  adapt: (...state: any[]) => ToState,
  storeName: string = "",
  config: Partial<Config> = {},
): ReadOnlyStore<ToState, AdapterTag> => {
  const mergedConfig = configMerge(config);
  const { optimizeStateChange } = mergedConfig;

  const isSingleStore = !Array.isArray(stores);
  let state = (
    isSingleStore
      ? adapt(stores.get())
      : adapt(...stores.map((store) => store.get()))
  ) as Freeze<ToState>;

  const readOnly = readOnlyStore(
    storeName,
    "adapter-readOnly",
    () => state,
    (storeID): AdapterStoreName =>
      `${storeID}:[${
        isSingleStore ? stores.id : stores.map(({ id }) => id).join(",")
      }]`,
    () => unsubscribe(),
  );
  const notify = getNotify(readOnly);

  const unsubscribe = watch(
    stores as AnyStore[],
    (newStates, info) => {
      const newState = (
        isSingleStore ? adapt(newStates) : adapt(...newStates)
      ) as Freeze<ToState>;
      if (!optimizeStateChange || isStateChanged(state, newState)) {
        notify((state = newState), info);
      }
    },
    mergedConfig,
  );

  return saveStore(readOnly);
};
