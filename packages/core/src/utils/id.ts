export type StoreID = number;
export type ActionID = number;
export type JobID = number;

const idCounter = <ID extends number>(): (() => ID) => {
  let id = 0;
  return () => id++ as ID;
};

export const nextStoreId = idCounter<StoreID>();
export const nextActionId = idCounter<ActionID>();
export const nextJobId = idCounter<JobID>();
