import type { JoinTag } from "./tag";
import type {
  ActionStore,
  AnyStore,
  InnerStoresType,
  KeysOfInnerStores,
} from "./store";

export type JoinState<Stores> = {
  [Name in keyof Stores]: Stores[Name] extends AnyStore<infer Type>
    ? Type
    : never;
};

export type ActionFnJoinReturn<Stores> =
  | Partial<Pick<InnerStoresType<Stores>, KeysOfInnerStores<Stores>>>
  | undefined;

export interface JoinStore<State>
  extends ActionStore<JoinState<State>, JoinTag> {}
