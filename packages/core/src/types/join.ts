import type { InnerStoresType, KeysOfInnerStores } from "./inner-store";
import type { ActionStore } from "./store";
import type { JoinTag } from "./tag";
import type { BasicStore } from "./read-only-store";

export type JoinState<Stores> = {
  [Name in keyof Stores]: Stores[Name] extends BasicStore<infer Type>
    ? Type
    : never;
};

export type ActionFnJoinReturn<Stores> =
  | Partial<Pick<InnerStoresType<Stores>, KeysOfInnerStores<Stores>>>
  | undefined;

export interface JoinStore<State>
  extends ActionStore<JoinState<State>, JoinTag> {}
