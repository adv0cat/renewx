import type { AnyStore } from "./types/any-store";
import type { Adapter, AdapterStore } from "./types/adapter";
import type { Freeze } from "./types/freeze";
import type { AdapterStoreName } from "./types/name";
import type { Config } from "./types/config";
import { readOnlyStore } from "./read-only-store";
import { saveStore } from "./api/store-api";
import { addAdjacency } from "./api/directed-acyclic-graph";
import { addProcessNewState } from "./api/new-state-api";
import { mergeConfig } from "./main-config";

export const adapter: Adapter = <ToState>(
  stores: AnyStore | AnyStore[],
  adapt: (states: any[] | any, isFirst: boolean) => ToState,
  storeName: string = "",
  config: Partial<Config> = {},
): AdapterStore<ToState> => {
  const isSingleStore = !Array.isArray(stores);
  const dependsOn = isSingleStore ? [stores.id] : stores.map((v) => v.id);

  const _readOnlyStore = readOnlyStore(
    adapt(
      isSingleStore ? stores.get() : stores.map((v) => v.get()),
      true,
    ) as Freeze<ToState>,
    storeName,
    (storeID): AdapterStoreName => `${storeID}:[${dependsOn.join(",")}]`,
    "ra",
  );

  addAdjacency(_readOnlyStore.id, dependsOn);
  addProcessNewState(
    _readOnlyStore,
    dependsOn,
    isSingleStore
      ? (states) => adapt(states[0], false) as Freeze<ToState>
      : (states) => adapt(states, false) as Freeze<ToState>,
    mergeConfig(config),
  );

  return saveStore(_readOnlyStore);
};
