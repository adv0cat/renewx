import {
  customRef,
  getCurrentScope,
  onScopeDispose,
  type ShallowRef,
} from "vue";
import { type AnyStore, type Freeze, isActionStore, watch } from "@renewx/core";

const CACHE: ShallowRef<Freeze<any>>[] = [];

export function useStore<T>(store: AnyStore<T>): ShallowRef<Freeze<T>> {
  return (CACHE[store.id] ??= customRef(
    (track, trigger) =>
      (getCurrentScope() && onScopeDispose(watch(store, trigger))) || {
        get: () => {
          track();
          return store.get();
        },
        set: isActionStore(store) ? store.set : trigger,
      },
  ));
}
