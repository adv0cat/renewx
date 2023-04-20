import type { Job, JobID, JobOptions } from "../interfaces/job";
import type { AsyncFn } from "../interfaces/core";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getIDCounter } from "../utils/get-id-counter";

const JOB = getIDCounter()
const RUNNING_JOBS = [] as Promise<unknown>[]

export const job = <NewJobFn extends AsyncFn>(jobFn: NewJobFn, { name }: JobOptions = {}): Job<NewJobFn> => {
    const jobID: JobID = `{${ name ?? JOB.newID() }}`

    console.info(`[${ jobID }] created`)

    return (...args) => {
        console.log(`[${ jobID }] run(${ getArgsForLog(args) })`)
        const runningJob = jobFn(...args)
        RUNNING_JOBS.push(runningJob)

        const removeJob = () => {
            RUNNING_JOBS.splice(RUNNING_JOBS.indexOf(runningJob), 1)
        }
        return runningJob.then((result) => {
            console.group(`[${ jobID }]%c resolve(${ getArgsForLog(args) })`, "color: #BDFF66", "->", result)
            removeJob()
            console.groupEnd()
            return result
        }, (reason) => {
            console.group(`[${ jobID }]%c reject(${ getArgsForLog(args) })`, "color: #FF5E5B")
            console.error(reason)
            removeJob()
            console.groupEnd()
            return reason
        })
    }
}
