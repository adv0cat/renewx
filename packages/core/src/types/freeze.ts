import type { Fn } from "./core";

export type Freeze<T> = T extends
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null
  | Fn
  | Date
  | RegExp
  | Promise<any>
  ? T
  : T extends Map<infer Key, infer Value> | ReadonlyMap<infer Key, infer Value>
    ? ReadonlyMap<Freeze<Key>, Freeze<Value>>
    : T extends WeakMap<infer Key, infer Value>
      ? WeakMap<Freeze<Key>, Freeze<Value>>
      : T extends Set<infer Value> | ReadonlySet<infer Value>
        ? ReadonlySet<Freeze<Value>>
        : T extends WeakSet<infer Value>
          ? WeakSet<Freeze<Value>>
          : T extends Array<infer Values> | ReadonlyArray<infer Values>
            ? any[] extends T
              ? ReadonlyArray<Freeze<Values>>
              : { readonly [Key in keyof T]: Freeze<T[Key]> }
            : T extends {}
              ? { readonly [Key in keyof T]: Freeze<T[Key]> }
              : unknown extends T
                ? unknown
                : Readonly<T>;
export type MaybeFreeze<State> = State | Freeze<State>;
