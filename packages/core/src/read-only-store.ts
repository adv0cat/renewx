import type { StoreID } from "./types/id";
import type { AnyStoreName } from "./types/name";
import type { ReadableTag } from "./types/tag";
import { getUnWatchList } from "./api/queue-api";
import type { ReadOnlyStore } from "./types/read-only-store";
import type { Freeze } from "./types/freeze";
import { createAdjacency } from "./api/directed-acyclic-graph";
import { allStates } from "./api/new-state-api";

let i: StoreID = 0;
export const readOnlyStore = <State, TagType extends ReadableTag>(
  initState: Freeze<State>,
  storeName: string,
  name: (storeID: StoreID) => AnyStoreName,
  tag: TagType,
): ReadOnlyStore<State, TagType> => {
  const storeID: StoreID = i++;
  allStates[storeID] = initState;
  const watchers = getUnWatchList<State>(storeID);
  createAdjacency(storeID);

  const get = () => allStates[storeID];
  let isOff = false;
  return {
    id: storeID,
    tag,
    get,
    unsafe: get,
    name: (): AnyStoreName => (storeName ||= name(storeID)),
    isOff: () => isOff,
    off: () => {
      isOff = true;
      watchers.forEach((fn) => fn());
      watchers.clear();
    },
  };
};
