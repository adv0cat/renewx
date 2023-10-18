import type { ActionID, StoreID } from "./id";
import type { JoinTag, WritableTag } from "./tag";
import type { ActionFnJoinReturn, JoinState } from "./join";
import type { Freeze, MaybeFreeze } from "./freeze";
import type { AnyActionStore } from "./any-store";
import type { OmitFirstArg } from "./core";

export interface Action {
  <Store extends AnyActionStore, NewActionFn extends ActionFn<Store>>(
    store: Store,
    fn: NewActionFn,
    name?: string,
  ): (...v: OmitFirstArg<NewActionFn>) => void;
}

export type ActionFn<Store extends AnyActionStore> =
  Store extends AnyActionStore<infer State, infer TagType>
    ? (state: Freeze<State>, ...v: any[]) => ActionFnReturn<State, TagType>
    : never;

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
}
