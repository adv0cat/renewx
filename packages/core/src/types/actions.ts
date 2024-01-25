import type { AnyActionStore } from "./any-store";
import type { ActionFn, ActionFnReturn, ActionInfo } from "./action";
import type { OmitFirstArg } from "./core";
import type { Off } from "./off";

export type Actions<
  Store extends AnyActionStore,
  PreActions extends Record<string, ActionFn<Store>>,
> = {
  [Index in keyof PreActions]: (...v: OmitFirstArg<PreActions[Index]>) => void;
};

export interface StoreActions<Store extends AnyActionStore> extends Off {
  store: Store;
  set(
    newState: Store extends AnyActionStore<infer State, infer TagType>
      ? ActionFnReturn<State, TagType>
      : never,
    info?: ActionInfo,
  ): void;
}
