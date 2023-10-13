import type { AnyTag, ReadableTag } from "./tag";
import type { StoreID } from "./id";
import type { Freeze } from "./freeze";
import type { AnyStoreName } from "./name";

export interface ReadOnlyStore<State, TagType extends AnyTag = ReadableTag> {
  id: StoreID;
  get(): Freeze<State>;
  unsafe(): State;
  name(): AnyStoreName;
  isOff: boolean;
  off(): void;
  tag: TagType;
}
