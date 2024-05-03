import type { AnyStore } from "./types/any-store";
import type { Adapter, AdapterStore } from "./types/adapter";
import type { Freeze } from "./types/freeze";
import type { AdapterStoreName } from "./types/name";
import type { Config } from "./types/config";
import { readOnlyStore } from "./read-only-store";
import { saveStore } from "./api/store-api";
import { addAdjacency } from "./api/directed-acyclic-graph";
import { addProcessNewState, NewStateFn } from "./api/new-state-api";
import { mergeConfig } from "./main-config";

export const adapter: Adapter = <ToState>(
  stores: AnyStore | AnyStore[],
  adapt: (states: any[] | any, isFirst: boolean) => ToState,
  storeName: string = "",
  config: Partial<Config> = {},
): AdapterStore<ToState> => {
  const isSingleStore = !Array.isArray(stores);
  const storeList = (isSingleStore ? [stores] : stores) as AnyStore[];
  const dependsOn = storeList.map(({ id }) => id);

  const getNewState: NewStateFn<ToState> = (states, isFirst) =>
    adapt(isSingleStore ? states[0] : states, isFirst) as Freeze<ToState>;

  const _readOnlyStore = readOnlyStore(
    getNewState(
      storeList.map(({ get }) => get()),
      true,
    ),
    storeName,
    (storeID): AdapterStoreName => `${storeID}:[${dependsOn.join(",")}]`,
    "ra",
  );

  addAdjacency(_readOnlyStore.id, dependsOn);
  addProcessNewState(
    _readOnlyStore,
    dependsOn,
    getNewState,
    mergeConfig(config),
  );

  return saveStore(_readOnlyStore);
};
