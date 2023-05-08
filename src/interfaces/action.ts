import type { ActionID, StoreID } from "./id";
import type { Freeze } from "../utils/freeze";
import type { AnyStores, StoresType } from "./store";
import type { KeysOfStores } from "./core";

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

export type ActionOptions = Partial<{ name: string }>;
export type ActionInfo = {
  id: ActionID;
  from: StoreID[];
  isSet?: boolean;
};
