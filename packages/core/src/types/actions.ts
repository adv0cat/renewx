import type { AnyActionStore } from "./any-store";
import type { ActionFn, ActionFnReturn, ActionInfo } from "./action";
import type { IsChanged, OmitFirstArg } from "./core";

export type Actions<
  Store extends AnyActionStore,
  PreActions extends Record<string, ActionFn<Store>>,
> = {
  [Index in keyof PreActions]: (
    ...v: OmitFirstArg<PreActions[Index]>
  ) => IsChanged;
};

export interface StoreActions<Store extends AnyActionStore> {
  store: Store;
  set(
    newState: Store extends AnyActionStore<infer State, infer TagType>
      ? ActionFnReturn<State, TagType>
      : never,
    info?: ActionInfo,
  ): IsChanged;
}
