import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import { ENV } from "../config/env";
import nodemailer from "nodemailer"



const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

export const emailWorker = new Worker(
  "emailQueue",
  async (job: Job) => {
    const { userId, email, name } = job.data as { userId: string; email: string; name?: string };

    if (job.name === "welcomeEmail") {
      // build email content
      const info = await transporter.sendMail({
        from: ENV.SMTP_USER,
        to: email,
        subject: "Welcome!",
        text: `Hello ${name || ""}, welcome!`,
        html: `<p>Hello ${name || ""}, welcome!</p>`,
      });
      console.log(`✉️ Sent welcome email to ${email} (msgId=${info.messageId})`);
    }
  },
  {
    connection: redis,
    concurrency: ENV.WORKER_CONCURRENCY_EMAIL,
  }
);

emailWorker.on("completed", (job) => console.log(`✅ Email job completed ${job.id} (${job.name})`));
emailWorker.on("failed", (job, err) => console.error(`❌ Email job failed ${job?.id}:`, err));
