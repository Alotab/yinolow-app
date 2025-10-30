import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  BULL_PREFIX: process.env.BULL_PREFIX || "adm:bull",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  WORKER_CONCURRENCY_EMAIL: Number(process.env.WORKER_CONCURRENCY_EMAIL || 5),
  WORKER_CONCURRENCY_ORDER: Number(process.env.WORKER_CONCURRENCY_ORDER || 3),
  WORKER_CONCURRENCY_IMAGE: Number(process.env.WORKER_CONCURRENCY_IMAGE || 2),
};
