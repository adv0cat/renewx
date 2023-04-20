import type { AsyncFnResult, AsyncFn } from "./core";

export type JobID = `{${ number | string }}`

export type Job<NewJobFn extends AsyncFn> = (...args: Parameters<NewJobFn>) => Promise<AsyncFnResult<NewJobFn>>
export type JobOptions = Partial<{ name: string }>
