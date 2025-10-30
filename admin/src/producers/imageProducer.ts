import { imageQueue } from "../queues/imageQueue";

export type ProcessImagePayload = { imageUrl: string; transformations: any };

export async function enqueueProcessImage(payload: ProcessImagePayload, delayMs?: number) {
  return imageQueue.add("processImage", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    delay: delayMs || 0,
    priority: 3,
  });
}
