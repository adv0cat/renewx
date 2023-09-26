import type { IsChanged } from "../types/core";
import type { AnyActionStore, AnyStore } from "../types/any-store";

const OBJECT = "object";
export const isStateChanged = (oldState: any, newState: any): IsChanged => {
  if (oldState === newState) {
    return false;
  } else if (
    oldState == null ||
    newState == null ||
    typeof newState !== OBJECT
  ) {
    // NOTE: If we need to check for NaN
    // return oldState === oldState || newState === newState;
    return true;
  }

  for (let key in newState) {
    if (!(key in oldState)) {
      return true;
    }

    const value = newState[key];
    const oldValue = oldState[key];
    if (value != null && oldValue != null && typeof value === OBJECT) {
      for (let innerKey in value) {
        if (value[innerKey] !== oldValue[innerKey]) {
          return true;
        }
      }
    } else if (value !== oldValue) {
      return true;
    }
  }

  for (let key in oldState) {
    if (!(key in newState)) {
      return true;
    }
  }

  return false;
};

export const isAnyStore = (v: any): v is AnyStore =>
  "id" in v && "tag" in v && "off" in v && typeof v.off === "function";

export const isActionStore = <State>(
  store: AnyStore<State>,
): store is AnyActionStore<State> => store.tag[0] === "w";
