import type { JobID } from "../interfaces/job";

export const getJobId = (jobID: string | number): JobID => {
    return Number.isInteger(jobID) ? `job-${ jobID as number }` : `${ jobID as string }Job`
}
