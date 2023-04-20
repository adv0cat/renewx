import type { Fn } from "../interfaces/core";

export type Freeze<T> = T extends Fn ? T : T extends object ? { readonly [P in keyof T]: Freeze<T[P]> } : Readonly<T>;

export const freeze = <T>(value: T | Freeze<T>): Freeze<T> => (Object.isFrozen(value) ? value : Object.freeze(value)) as Freeze<T>
