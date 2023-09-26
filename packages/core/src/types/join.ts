import type { JoinTag } from "./tag";
import type {
  ActionStore,
  KeysOfActionStores,
  OnlyActionStores,
} from "./action-store";
import type { AnyStore } from "./any-store";

export type JoinState<Stores extends Record<string, AnyStore>> = {
  [Name in keyof Stores]: Stores[Name] extends AnyStore<infer Type>
    ? Type
    : never;
};

export type ActionFnJoinReturn<Stores extends Record<string, AnyStore>> =
  | Partial<Pick<OnlyActionStores<Stores>, KeysOfActionStores<Stores>>>
  | undefined;

export interface JoinStore<Stores extends Record<string, AnyStore>>
  extends ActionStore<JoinState<Stores>, JoinTag> {}
