import type { ActionStore } from "./store";
import type { SerialTag } from "./tag";

export type Serial<State> = { order: number; state: State };
export type StateFromSerial<SerialType> = SerialType extends Serial<infer State>
  ? State
  : never;

export interface SerialStore<State>
  extends ActionStore<Serial<State>, SerialTag> {}
