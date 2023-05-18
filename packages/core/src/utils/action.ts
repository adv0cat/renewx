import type { Freeze } from "./freeze";
import type { AnyStores, StoresType } from "./store";
import type { KeysOfStores } from "./core";
import type { ActionID, StoreID } from "./id";

export type ActionFn<State> = (
  state: Freeze<State>,
  ...args: any[]
) => ActionFnReturn<State>;

export type ActionFnReturn<State> = State extends StoresType<
  infer SomeStores extends AnyStores
>
  ? KeysOfStores<SomeStores> extends never
    ? State | Freeze<State>
    : Partial<Pick<State, KeysOfStores<SomeStores>>> | undefined
  : State | Freeze<State>;

export type ActionInfo = {
  id: ActionID;
  path: StoreID[];
  set?: boolean;
};
