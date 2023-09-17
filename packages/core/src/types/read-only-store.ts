import type { AnyTag, isReadOnly, ReadableTag } from "./tag";
import type { StoreID } from "../utils/id";
import type { Freeze } from "./freeze";
import type { Unsubscribe } from "./core";
import type { AnyStoreName } from "./name";
import type { ActionInfo } from "./action";

export type Watcher<State> = (
  state: Freeze<State>,
  info?: ActionInfo,
) => Unsubscribe | void;

export interface ReadOnlyStore<State, TagType extends AnyTag = ReadableTag> {
  id: StoreID;
  get(): Freeze<State>;
  watch(fn: Watcher<State>): Unsubscribe;
  name(): AnyStoreName;
  off(): void;
  isReadOnly: isReadOnly<TagType>;
  tag: TagType;
}
