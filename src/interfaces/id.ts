export type StoreID = number; // 42
export type StoreName = `${StoreID}`; // "42"
export type AdapterStoreName = `${StoreID}:[${string}]`; // "42:[2,13]"
export type JoinStoreName = `${StoreID}:{${string}}`; // "42:{2,13}"
export type AnyStoreName =
  | StoreName
  | AdapterStoreName
  | JoinStoreName
  | string;

export type ActionID = number;
export type JobID = number;
