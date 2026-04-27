import IORedis from "ioredis";
import { env } from "./env.js";

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});
