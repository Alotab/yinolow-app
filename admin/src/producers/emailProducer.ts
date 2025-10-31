import { emailQueue } from "../queues/emailQueue";

export type OrderEmailPayload = {
  orderId: string;
  userId: string;
  email: string;
  success: boolean;
  reason?: string;
};

export async function enqueueOrderConfirmationEmail(payload: OrderEmailPayload) {
  return emailQueue.add("orderConfirmation", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    priority: 2,
  });
}
