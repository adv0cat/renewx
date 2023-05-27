import type { Freeze, MaybeFreeze } from "./freeze";
import type { ActionID, StoreID } from "./id";
import type { StateFromSerial } from "./serial";
import type { JoinMark, SerialMark, WritableMark } from "./mark";
import type { ActionFnJoinReturn, JoinState } from "./join";

export type ActionFn<State, MarkType extends WritableMark> = (
  state: Freeze<State>,
  ...args: any[]
) => ActionFnReturn<State, MarkType>;

export type ActionFnReturn<
  State,
  MarkType extends WritableMark
> = MarkType extends SerialMark
  ? MaybeFreeze<StateFromSerial<State>>
  : MarkType extends JoinMark
  ? State extends JoinState<infer Stores>
    ? ActionFnJoinReturn<Stores>
    : never
  : MaybeFreeze<State>;

export type ActionInfo = {
  id: ActionID;
  path: StoreID[];
  set?: boolean;
};
