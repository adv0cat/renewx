export type IsChanged = boolean
export type Unsubscribe = () => void
export type Fn<Result = any> = (...args: any[]) => Result
export type AsyncFn<Result = any> = (...args: any[]) => Promise<Result>
export type AsyncFnResult<NewJobFn extends AsyncFn> = NewJobFn extends AsyncFn<infer Result> ? Result : never
export type OmitFirstArg<Fn> = Fn extends (arg: any, ...args: infer Args) => any
    ? Args
    : never
