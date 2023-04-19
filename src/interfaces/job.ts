export type JobID = `job-${ number }` | `${ string }Job`

export type JobFn = (...args: any[]) => Promise<unknown>
export type Job<NewJobFn extends JobFn> = (...args: Parameters<NewJobFn>) => ReturnType<NewJobFn>
export type JobOptions = Partial<{ name: string }>
