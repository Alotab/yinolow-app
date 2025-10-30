import { Queue, QueueEvents } from "bullmq";
import { redis } from "../lib/redis";
import { ENV } from "../config/env";



export const emailQueue = new Queue("emailQueue", {
  connection: redis,
  prefix: ENV.BULL_PREFIX,
});

// NEW in BullMQ v5: use QueueEvents instead of QueueScheduler
export const emailQueueEvents = new QueueEvents("emailQueue", {
  connection: redis,
  prefix: ENV.BULL_PREFIX,
});

// Optional: listen for important lifecycle events
emailQueueEvents.on("completed", ({ jobId }) => {
  console.log(`✅ Job ${jobId} completed`);
});

emailQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed: ${failedReason}`);
});

                       















// export const emailQueue = new Queue("emailQueue", { connection: redis});