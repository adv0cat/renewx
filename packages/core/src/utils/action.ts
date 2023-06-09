import type { Freeze, MaybeFreeze } from "./freeze";
import type { ActionID, StoreID } from "./id";
import type { StateFromSerial } from "./serial";
import type { JoinTag, SerialTag, WritableTag } from "./tag";
import type { ActionFnJoinReturn, JoinState } from "./join";

export type ActionFn<State, TagType extends WritableTag> = (
  state: Freeze<State>,
  ...args: any[]
) => ActionFnReturn<State, TagType>;

export type ActionFnReturn<
  State,
  TagType extends WritableTag
> = TagType extends SerialTag
  ? MaybeFreeze<StateFromSerial<State>>
  : TagType extends JoinTag
  ? State extends JoinState<infer Stores>
    ? ActionFnJoinReturn<Stores>
    : never
  : MaybeFreeze<State>;

export type ActionInfo = {
  id: ActionID;
  path: StoreID[];
  set?: boolean;
};
