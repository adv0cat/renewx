import { nextStoreId, type StoreID } from "./utils/id";
import type { AnyStoreName } from "./types/name";
import type { isReadOnly, ReadableTag } from "./types/tag";
import { getWatchers } from "./api/queue-api";
import type { ReadOnlyStore } from "./types/read-only-store";
import type { Unsubscribe } from "./types/core";

export const readOnlyStore = <State, TagType extends ReadableTag>(
  get: ReadOnlyStore<State>["get"],
  tag: TagType,
  off: Unsubscribe,
  storeName: string,
  name: (storeID: StoreID) => AnyStoreName,
): ReadOnlyStore<State, TagType> => {
  const storeID = nextStoreId();
  const watchers = getWatchers<State>(storeID);

  return {
    id: storeID,
    tag,
    get,
    isReadOnly: true as isReadOnly<TagType>,
    name: (): AnyStoreName => (storeName ||= name(storeID)),
    off: () => {
      off();
      watchers.forEach((fn) => fn());
      watchers.clear();
    },
  };
};
