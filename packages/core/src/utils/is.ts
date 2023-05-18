import type { IsChanged } from "./core";

const OBJECT = "object";
export const isStateChanged = (oldState: any, newState: any): IsChanged => {
  if (oldState === newState) {
    return false;
  } else if (
    typeof oldState !== OBJECT ||
    oldState == null ||
    newState == null
  ) {
    return true;
  }

  for (let key in newState) {
    const value = newState[key];
    const oldValue = oldState[key];
    if (!(key in oldState)) {
      return true;
    } else if (typeof value === OBJECT && value !== null) {
      for (let innerKey in value) {
        const innerValue = value[innerKey];
        if (typeof innerValue === OBJECT && innerValue !== null) {
          // Nothing to do... Because we don't need more deepening
        } else if (innerValue !== oldValue[innerKey]) {
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
