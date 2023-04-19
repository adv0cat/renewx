export type IsChanged = boolean
export type Unsubscribe = () => void
export type OmitFirstArg<Fn> = Fn extends (arg: any, ...args: infer Args) => any
    ? Args
    : never
