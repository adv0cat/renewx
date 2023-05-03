const idCounter = (): (() => number) => {
  let id = 0;
  return () => ++id;
};

export const nextStoreId = idCounter();
export const nextActionId = idCounter();
export const nextJobId = idCounter();
