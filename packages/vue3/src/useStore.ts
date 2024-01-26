import { customRef, getCurrentScope, onScopeDispose, type Ref } from "vue";
import { type AnyStore, type Freeze, isActionStore, watch } from "@renewx/core";

export function useStore<T>(store: AnyStore<T>): Ref<Freeze<T>> {
  return customRef(
    (track, trigger) =>
      (getCurrentScope() && onScopeDispose(watch(store, trigger))) || {
        get: () => {
          track();
          return store.get();
        },
        set: isActionStore(store) ? store.set : trigger,
      },
  );
}
