import type { Freeze } from "./freeze";
import type { IsValid } from "./core";

export type Validator<State> = (
  old: Freeze<State>,
  state: Freeze<State>,
) => IsValid;
