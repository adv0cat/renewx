import type { Job, JobOptions } from "../interfaces/job";
import type { AsyncFn } from "../interfaces/core";
import type { JobID } from "../interfaces/id";
import { nextJobId } from "../utils/id";
import { getArgsForLog } from "../utils/get-args-for-log";

const RUNNING_JOBS = [] as Promise<unknown>[];

export const allJobs = async (): Promise<void> => {
  if (RUNNING_JOBS.length === 0) {
    return Promise.resolve();
  } else {
    await Promise.all(RUNNING_JOBS);
    return allJobs();
  }
};

export const job = <NewJobFn extends AsyncFn>(
  jobFn: NewJobFn,
  options: JobOptions = {}
): Job<NewJobFn> => {
  const jobID: JobID = nextJobId();
  const jobName =
    options.name != null ? `${jobID}-"${options.name}"` : `${jobID}`;

  console.info(`[${jobName}] created`);

  return (...args) => {
    console.log(`${jobName}.run(${getArgsForLog(args)})`);
    const runningJob = jobFn(...args);
    RUNNING_JOBS.push(runningJob);

    const removeJob = () => {
      RUNNING_JOBS.splice(RUNNING_JOBS.indexOf(runningJob), 1);
    };
    return runningJob.then(
      (result) => {
        console.group(
          `${jobID}%c resolve(${getArgsForLog(args)})`,
          "color: #BDFF66",
          "->",
          result
        );
        removeJob();
        console.groupEnd();
        return result;
      },
      (reason) => {
        console.group(
          `${jobID}%c reject(${getArgsForLog(args)})`,
          "color: #FF5E5B"
        );
        console.error(reason);
        removeJob();
        console.groupEnd();
        return reason;
      }
    );
  };
};
