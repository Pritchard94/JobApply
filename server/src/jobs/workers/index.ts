import { jobSearchWorker } from "./job-search.worker.js";
import { cvParseWorker } from "./cv-parse.worker.js";
import { applicationWorker } from "./application.worker.js";
import { logger } from "../../utils/logger.js";

export function startWorkers() {
  logger.info("Starting background workers...");

  jobSearchWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} of type ${job.name} completed successfully`);
  });

  jobSearchWorker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} of type ${job?.name} failed: ${err.message}`);
  });

  // Add same handlers for others if needed
  cvParseWorker.on("failed", (job, err) => {
    logger.error(`CV Parse Job ${job?.id} failed: ${err.message}`);
  });

  applicationWorker.on("failed", (job, err) => {
    logger.error(`Application Job ${job?.id} failed: ${err.message}`);
  });

  return {
    jobSearchWorker,
    cvParseWorker,
    applicationWorker,
  };
}
