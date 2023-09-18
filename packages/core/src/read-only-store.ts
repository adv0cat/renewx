import { nextStoreId, type StoreID } from "./utils/id";
import type { AnyStoreName } from "./types/name";
import type { AnyTag, isReadOnly, ReadableTag } from "./types/tag";
import type { Unsubscribe } from "./types/core";
import { isNotLastWatcher, registryWatchers } from "./api/queue-api";
import type { ReadOnlyStore } from "./types/read-only-store";
import { getUnsubscribe } from "./utils/get-unsubscribe";
import { getAddInfo } from "./api/action-api";

export const readOnlyStore = <State, TagType extends AnyTag = ReadableTag>(
  storeName: string,
  tag: TagType,
  get: ReadOnlyStore<State>["get"],
  name: (storeID: StoreID) => AnyStoreName,
  off: () => void,
): ReadOnlyStore<State, TagType> => {
  let isOff = false;
  const storeID = nextStoreId();
  const watchers = registryWatchers<State>(storeID);

  return {
    id: storeID,
    tag,
    get,
    isReadOnly: true as isReadOnly<TagType>,
    name: (): AnyStoreName => (storeName ||= name(storeID)),
    off: () => {
      isOff = true;
      off();
      watchers.forEach((unsubscribe) => unsubscribe());
      watchers.clear();
    },
    watch: (watcher): Unsubscribe => {
      if (isOff) {
        return () => {};
      }

      watchers.set(
        watcher,
        getUnsubscribe(
          watcher(
            get(),
            getAddInfo() ? { id: -1, path: [storeID] } : undefined,
          ),
        ),
      );

      return () => {
        if (isNotLastWatcher(watcher)) {
          getUnsubscribe(watchers.get(watcher))();
        }
        watchers.delete(watcher);
      };
    },
  };
};
