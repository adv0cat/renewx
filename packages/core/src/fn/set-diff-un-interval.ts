import type { Unsubscribe } from "../types/core";

export const setDiffUnInterval = (
  tick: (diff: number) => void,
  timeout = 100,
): Unsubscribe => {
  // If startTime is 0, the interval is stopped forever
  let startTime = Date.now();
  let isOnTick = false;
  const onTick = () => {
    if (startTime !== 0) {
      isOnTick = true;
      const newTime = Date.now();
      try {
        tick(newTime - startTime);
        // NOTE: If we set isOnTick to false in unsubscribe function, then we should set startTime to 0 here
        startTime = isOnTick ? newTime : 0;
      } catch (e) {
        console.error("Diff interval tick error:", e);
      }
      isOnTick = false;
    }
  };
  const intervalId = setInterval(onTick, timeout);

  // Return a unsubscribe function
  return () => {
    if (startTime !== 0) {
      clearInterval(intervalId);
      if (isOnTick) {
        // NOTE: If we call unsubscribe function in the tick function, then we should set isOnTick to false
        isOnTick = false;
      } else {
        onTick();
        startTime = 0;
      }
    }
  };
};
