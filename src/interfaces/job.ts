import type { AsyncFn, AsyncFnResult } from "./core";

export type Job<NewJobFn extends AsyncFn> = (...args: Parameters<NewJobFn>) => Promise<AsyncFnResult<NewJobFn>>
export type JobOptions = Partial<{ name: string }>
