import type { AnyStore } from "../interfaces/store";
import type { ActionID } from "../interfaces/action";

export const getInnerSetActionID = (store: AnyStore): ActionID => `${ store.id() }.inner.set`
