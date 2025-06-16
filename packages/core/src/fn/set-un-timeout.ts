import type { Unsubscribe } from "@renewx/core";

export const setUnTimeout = (
  callback: (...args: any) => void,
  timeout = 0,
): Unsubscribe => {
  const done = () => {
    if (~timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = -1;
      callback();
    }
  };
  let timeoutId: ReturnType<typeof setTimeout> | -1 = setTimeout(done, timeout);
  return done;
};
