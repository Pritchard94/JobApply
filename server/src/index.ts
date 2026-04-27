import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startWorkers } from "./jobs/workers/index.js";
import { logger } from "./utils/logger.js";

const app = createApp();

// Start background workers
startWorkers();

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
