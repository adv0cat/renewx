import type { IsChanged } from "../types/core";

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
