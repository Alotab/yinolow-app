import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import { ENV } from "../config/env";
// import db models or services as needed

export const orderWorker = new Worker(
  "orderQueue",
  async (job: Job) => {
    const { orderId, userId } = job.data as { orderId: string; userId: string };

    if (job.name === "processOrder") {
      console.log(`🛠 Processing order ${orderId}`);
      // Example steps (you should replace with real logic):
      // 1) Validate payment (call payment provider)
      // 2) Decrement stock (DB transaction)
      // 3) Create shipment (call shipping service)
      // 4) Enqueue email notifications (call enqueueWelcomeEmail or emailQueue.add)
      // Simulate processing time:
      await new Promise((res) => setTimeout(res, 1500));
      console.log(`✅ Order ${orderId} processed`);
    }
  },
  {
    connection: redis,
    concurrency: ENV.WORKER_CONCURRENCY_ORDER,
  }
);

orderWorker.on("completed", (job) => console.log(`✅ Order job completed ${job.id} (${job.name})`));
orderWorker.on("failed", (job, err) => console.error(`❌ Order job failed ${job?.id}:`, err));
