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
  app.use(helmet({
    crossOriginResourcePolicy: false, // Allow images from other domains (Supabase storage)
  }));
  
  // CORS Configuration
  const allowedOrigins = [
    env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    /\.vercel\.app$/, // Allow all Vercel previews
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some((allowed) => {
          if (allowed instanceof RegExp) {
            return allowed.test(origin);
          }
          return allowed === origin;
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          console.warn(`CORS blocked for origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
