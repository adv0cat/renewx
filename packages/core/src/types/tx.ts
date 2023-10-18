import type { Freeze } from "./freeze";
import type { WritableTag } from "./tag";
import type { ActionFnReturn } from "./action";
import type { AnyStore } from "./any-store";

export interface ReadOnlyTxState<State> {
  get(): Freeze<State>;
  unsafe(): State;
}

export interface TxState<State, TagType extends WritableTag>
  extends ReadOnlyTxState<State> {
  set(v: ActionFnReturn<State, TagType>): void;
}

export type TxStates<Stores extends AnyStore[]> = {
  [Index in keyof Stores]: Stores[Index] extends AnyStore<
    infer State,
    infer TagType
  >
    ? TagType extends WritableTag
      ? TxState<State, TagType>
      : ReadOnlyTxState<State>
    : never;
};

export type TxFn<Stores extends AnyStore[]> = (
  states: TxStates<Stores>,
  ...args: any[]
) => any;
