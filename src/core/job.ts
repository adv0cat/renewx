import type { Job, JobFn, JobOptions } from "../interfaces/job";
import { getArgsForLog } from "../utils/get-args-for-log";
import { getJobId } from "../utils/get-job-id";
import { JOB } from "../inner/counters";

const runningJobs = [] as Promise<unknown>[]

export const job = <NewJobFn extends JobFn>(jobFn: NewJobFn, { name }: JobOptions = {}): Job<NewJobFn> => {
    const jobID = getJobId(name ?? JOB.newID())

    console.info(`[${ jobID }] created`)

    return (...args) => {
        const argsLog = `(${ getArgsForLog(args) })`
        console.log(`[${ jobID }] run${ argsLog }`)
        const runningJob = jobFn(...args) as ReturnType<NewJobFn>
        runningJobs.push(runningJob)

        const removeJob = () => {
            console.log(`[${ jobID }] before removeJob`, "->", "runningJobs:", runningJobs)
            runningJobs.splice(runningJobs.indexOf(runningJob), 1)
            console.log(`[${ jobID }] after removeJob`, "->", "runningJobs:", runningJobs)
        }
        runningJob.then((result) => {
            console.group(`[${ jobID }]%c resolve${ argsLog }`, "color: #BDFF66", "->", result)
            removeJob()
            console.groupEnd()
        }, (reason) => {
            console.group(`[${ jobID }]%c reject${ argsLog }`, "color: #FF5E5B")
            console.error(reason)
            removeJob()
            console.groupEnd()
        })
        return runningJob
    }
}
