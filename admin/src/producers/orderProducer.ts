








// src/producers/orderProducer.ts
import { orderQueue } from "../queues/orderQueue";

export type PostPaymentPayload = {
  orderId: string;
  paymentIntentId?: string;
};

export async function enqueuePostPaymentJob(payload: PostPaymentPayload) {
  return orderQueue.add("postPayment", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
    priority: 1,
  });
}

















// import { orderQueue } from "../queues/orderQueue";

// export type ProcessOrderPayload = { 
//   orderId: string;
//   paymentMethodId?: string;    // token from frontend (stripe paymentmethod)
//   source?: any; 
//   // userId: string; 
//   // attempt?: number 
// };

// export async function enqueueProcessOrder(payload: ProcessOrderPayload) {
//   // urgent order processing should be higher priority
//   return orderQueue.add("processOrder", payload, {
//     attempts: 5,
//     backoff: { type: "exponential", delay: 2000 },
//     // timeout: 1000 * 60 * 5, // 5 min job timeout
//     removeOnComplete: true,
//     removeOnFail: false,
//     priority: 1,
//     // do not put huge payloads here; keep payment tokens and orderId only
//   });
// }
