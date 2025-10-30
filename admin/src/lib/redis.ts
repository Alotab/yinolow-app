import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const redis = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
    maxRetriesPerRequest: null, // ✅ REQUIRED for BullMQ
  // ❌ don't include password if not set
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
});
