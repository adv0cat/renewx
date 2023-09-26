import type { StoreTag } from "./tag";
import type { ActionStore } from "./action-store";

export interface Store<State> extends ActionStore<State, StoreTag> {}
