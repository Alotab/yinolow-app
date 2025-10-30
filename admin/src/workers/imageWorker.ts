import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import sharp from "sharp";
import fetch from "node-fetch"; // or use axios
import { ENV } from "../config/env";


export const imageWorker = new Worker(
  "imageQueue",
  async (job: Job) => {
    const { imageUrl, transformations } = job.data as { imageUrl: string; transformations: any };
    if (job.name === "processImage") {
      console.log(`🖼 Processing image ${imageUrl}`);
      // Example: fetch image -> transform with sharp -> upload to S3 (not implemented here)
      const res = await fetch(imageUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      const processed = await sharp(buffer).resize(transformations.width || 800).toFormat("webp").toBuffer();
      // upload processed to storage (S3/Cloudinary) -> omitted
      console.log(`✅ Image processed (${processed.length} bytes)`);
    }
  },
  {
    connection: redis,
    concurrency: ENV.WORKER_CONCURRENCY_IMAGE,
  }
);

imageWorker.on("completed", (job) => console.log(`✅ Image job completed ${job.id} (${job.name})`));
imageWorker.on("failed", (job, err) => console.error(`❌ Image job failed ${job?.id}:`, err));
