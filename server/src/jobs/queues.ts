import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

const DEFAULT_OPTIONS = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
  },
};

export const jobSearchQueue = new Queue("job-search", DEFAULT_OPTIONS);
export const cvParseQueue = new Queue("cv-parse", DEFAULT_OPTIONS);
export const applicationQueue = new Queue("application", DEFAULT_OPTIONS);
export const notificationQueue = new Queue("notification", DEFAULT_OPTIONS);
