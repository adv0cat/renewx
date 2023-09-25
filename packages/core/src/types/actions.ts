import type { AnyActionStore } from "./any-store";
import type { ActionFn } from "./action";
import type { IsChanged, OmitFirstArg } from "./core";

export type ActionsFn<Store extends AnyActionStore> =
  Store extends AnyActionStore<infer State, infer TagType>
    ? Record<string, ActionFn<State, TagType>>
    : never;

export type Actions<
  Store extends AnyActionStore,
  PreActions extends ActionsFn<Store>,
> = {
  [Index in keyof PreActions]: (
    ...args: OmitFirstArg<PreActions[Index]>
  ) => IsChanged;
};
