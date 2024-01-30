import {
  customRef,
  getCurrentScope,
  onScopeDispose,
  type ShallowRef,
} from "vue";
import {
  type AnyActionStore,
  type AnyStore,
  type Freeze,
  watch,
} from "@renewx/core";

const CACHE: ShallowRef<Freeze<any>>[] = [];
const CACHE_TRACK: (() => void)[] = [];

const trackStore = (
  store: AnyStore,
  withOff: boolean,
  trigger = CACHE_TRACK[store.id],
  unWatch = trigger && getCurrentScope() && watch(store, trigger),
) =>
  unWatch &&
  onScopeDispose(
    () =>
      (withOff &&
        delete CACHE[store.id] &&
        delete CACHE_TRACK[store.id] &&
        store.off()) ||
      unWatch(),
  );

export const useStore = <T>(
  store: AnyStore<T>,
  withOff = false,
): ShallowRef<Freeze<T>> =>
  trackStore(store, withOff) ||
  CACHE[store.id] ||
  (CACHE[store.id] = customRef(
    (track, trigger) =>
      trackStore(store, withOff, (CACHE_TRACK[store.id] = trigger)) || {
        get: () => (track() as undefined) || store.get(),
        set: (store as AnyActionStore).set || trigger,
      },
  ));
