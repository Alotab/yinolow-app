import { Queue, QueueEvents } from "bullmq";
import { redis } from "../lib/redis";
import { ENV } from "../config/env";



export const orderQueue = new Queue("orderQueue", {
  connection: redis,
  prefix: ENV.BULL_PREFIX,
});

export const orderQueueEvents = new QueueEvents("orderQueue", {
  connection: redis,
  prefix: ENV.BULL_PREFIX,
});





// export const orderQueue = new Queue("orderQueue", { connection: redis });