import type { AnyTag, ReadableTag } from "./tag";
import type { StoreID } from "./id";
import type { Freeze } from "./freeze";
import type { AnyStoreName } from "./name";
import type { Off } from "./off";

export interface ReadOnlyStore<State, TagType extends AnyTag = ReadableTag>
  extends Off {
  id: StoreID;
  get(): Freeze<State>;
  unsafe(): State;
  name(): AnyStoreName;
  isOff(): boolean;
  tag: TagType;
}
