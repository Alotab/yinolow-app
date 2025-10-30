import { orderQueue } from "../queues/orderQueue";

export type ProcessOrderPayload = { 
  orderId: string;
  paymentMethod?: string;    // token from frontend (stripe paymentmethod)
  source?: any; 
  // userId: string; 
  // attempt?: number 
};

export async function enqueueProcessOrder(payload: ProcessOrderPayload) {
  // urgent order processing should be higher priority
  return orderQueue.add("processOrder", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    // timeout: 1000 * 60 * 5, // 5 min job timeout
    removeOnComplete: true,
    removeOnFail: false,
    priority: 1,
    // do not put huge payloads here; keep payment tokens and orderId only
  });
}
