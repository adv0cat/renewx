import { nextStoreId, type StoreID } from "./utils/id";
import type { AnyStoreName } from "./types/name";
import type { AnyTag, isReadOnly, ReadableTag } from "./types/tag";
import { getWatchers } from "./api/queue-api";
import type { ReadOnlyStore } from "./types/read-only-store";

export const readOnlyStore = <State, TagType extends AnyTag = ReadableTag>(
  storeName: string,
  tag: TagType,
  get: ReadOnlyStore<State>["get"],
  name: (storeID: StoreID) => AnyStoreName,
  off: () => void,
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
      watchers.forEach((unsubscribe) => unsubscribe());
      watchers.clear();
    },
  };
};
