export type StoreID = `[${number | string}]`;
export type AdapterStoreID = `(${string}=>${string | number})`;
export type JoinStoreID = `{${string}}`;
export type ActionID = string | number | "init" | `${string}.#${"set" | "off"}`;
export type JobID = `{${number | string}}`;
