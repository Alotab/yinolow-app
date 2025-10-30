import { Queue, QueueEvents } from "bullmq";
import { redis } from "../lib/redis";
import { ENV } from "../config/env";

export const imageQueue = new Queue("imageQueue", {
  connection: redis,
  prefix: ENV.BULL_PREFIX,
});

export const imageQueueEvents = new QueueEvents("imageQueue", {
  connection: redis,
  prefix: ENV.BULL_PREFIX,
});
