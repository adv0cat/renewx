import type { Freeze } from "../utils/freeze";
import type { ActionFnReturn } from "./action";
import type { IsValid } from "./core";

export type ValidationFn<State> = (
  old: Freeze<State>,
  state: ActionFnReturn<State>
) => IsValid;
