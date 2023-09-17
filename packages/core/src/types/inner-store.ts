import type { ActionStore } from "./store";
import type { AnyStore } from "./any-store";
import type { ActionFnReturn, ActionInfo } from "./action";
import type { IsChanged, KeysOfObject } from "./core";
import type { WritableTag } from "./tag";

export interface InnerStore<State, TagType extends WritableTag>
  extends ActionStore<State, TagType> {
  set(newState: ActionFnReturn<State, TagType>, info?: ActionInfo): IsChanged;
}

export type InnerStoresType<InnerStores> = {
  [Name in keyof InnerStores]: InnerStores[Name] extends InnerStore<
    infer Type,
    WritableTag
  >
    ? Type
    : never;
};

export type KeysOfInnerStores<InnerStores> = KeysOfObject<
  InnerStoresType<InnerStores>
>;

export const isInnerStore = <State>(
  store: AnyStore<State>,
): store is InnerStore<State, WritableTag> => !store.isReadOnly;
