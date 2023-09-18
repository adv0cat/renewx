import type { ActionID, StoreID } from "../utils/id";
import type { JoinTag, WritableTag } from "./tag";
import type { ActionFnJoinReturn, JoinState } from "./join";
import type { Freeze, MaybeFreeze } from "./freeze";

export type ActionFn<State, TagType extends WritableTag> = (
  state: Freeze<State>,
  ...args: any[]
) => ActionFnReturn<State, TagType>;

export type ActionFnReturn<
  State,
  TagType extends WritableTag,
> = TagType extends JoinTag
  ? State extends JoinState<infer Stores>
    ? ActionFnJoinReturn<Stores>
    : never
  : MaybeFreeze<State>;

export interface ActionInfo {
  id: ActionID;
  path: StoreID[];
  set?: boolean;
}
