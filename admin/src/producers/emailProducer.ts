import { emailQueue } from "../queues/emailQueue";

export type WelcomeEmailPayload = { userId: string; email: string; name?: string };

export async function enqueueWelcomeEmail(payload: WelcomeEmailPayload) {
  return emailQueue.add("welcomeEmail", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 }, // retries: 1s, 2s, 4s...
    removeOnComplete: { age: 60 * 60 }, // keep job result for 1h
    removeOnFail: false,
    priority: 2,
  });
}
