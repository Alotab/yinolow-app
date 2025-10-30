import { logger } from "../utils/logger";
import { emailQueueEvents, orderQueueEvents, imageQueueEvents } from "../queues";
import { emailWorker } from "./emailWorker";
import { orderWorker } from "./orderWorker";
import { imageWorker } from "./imageWorker";
import { setupGracefulShutdown } from "../utils/graceful";

logger.info("🚀 Starting workers and schedulers...");

// ensure schedulers are referenced (QueueScheduler constructors already created in queues)
const stopFns = [
  async () => {
    await emailWorker.close();
    await orderWorker.close();
    await imageWorker.close();
  },
  async () => {
    // close schedulers by disconnecting Redis connection (optional)
  },
];

setupGracefulShutdown(stopFns);



// logger.info("All background workers running...");