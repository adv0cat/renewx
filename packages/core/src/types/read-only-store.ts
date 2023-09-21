import type { AnyTag, isReadOnly, ReadableTag } from "./tag";
import type { StoreID } from "../utils/id";
import type { Freeze } from "./freeze";
import type { Unsubscribe } from "./core";
import type { AnyStoreName } from "./name";
import type { Watcher } from "./watch";

export interface ReadOnlyStore<State, TagType extends AnyTag = ReadableTag>
  extends BasicStore<State> {
  watch(fn: Watcher<State>): Unsubscribe;
  name(): AnyStoreName;
  off(): void;
  isReadOnly: isReadOnly<TagType>;
  tag: TagType;
}

export interface BasicStore<State> {
  id: StoreID;
  get(): Freeze<State>;
}
