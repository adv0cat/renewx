import type { ActionStore } from "./store";
import type { SerialMark } from "./mark";

export type Serial<State> = { order: number; state: State };
export type StateFromSerial<SerialType> = SerialType extends Serial<infer State>
  ? State
  : never;

export interface SerialStore<State>
  extends ActionStore<Serial<State>, SerialMark> {}
