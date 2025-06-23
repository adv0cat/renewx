import {
  customRef,
  getCurrentScope,
  onScopeDispose,
  type ShallowRef,
} from "vue";
import {
  type AnyActionStore,
  type AnyStore,
  type Config,
  type Freeze,
  watch,
} from "@renewx/core";

interface Vue3Config extends Config {
  withOff: boolean;
}

const CACHE: ShallowRef<Freeze<any>>[] = [];
const CACHE_TRACK: (() => void)[] = [];

const trackStore = (
  store: AnyStore,
  config: Partial<Vue3Config>,
  trigger = CACHE_TRACK[store.id],
  unWatch = trigger && getCurrentScope() && watch(store, trigger, config),
) =>
  unWatch &&
  onScopeDispose(
    () =>
      (config.withOff &&
        delete CACHE[store.id] &&
        delete CACHE_TRACK[store.id] &&
        store.off()) ||
      unWatch(),
  );

export const useStore = <T>(
  store: AnyStore<T>,
  config: Partial<Vue3Config> = {},
): ShallowRef<Freeze<T>> =>
  trackStore(store, config) ||
  CACHE[store.id] ||
  (CACHE[store.id] = customRef(
    (track, trigger) =>
      trackStore(store, config, (CACHE_TRACK[store.id] = trigger)) || {
        get: () => (track(), store.get()),
        set: (store as AnyActionStore).set || trigger,
      },
  ));
