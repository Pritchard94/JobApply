import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );

  // Parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use("/api/", generalLimiter);

  // API routes
  app.use("/api/v1", apiRouter);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
