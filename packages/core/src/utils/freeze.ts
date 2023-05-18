import type { Fn } from "./core";

export type Freeze<T> = T extends Fn
  ? T
  : T extends Promise<any>
  ? Readonly<T>
  : T extends object
  ? { readonly [P in keyof T]: Freeze<T[P]> }
  : Readonly<T>;
