
import { Worker, Job } from "bullmq";
import { redis } from "../lib/redis";
import nodemailer from "nodemailer";
import { ENV } from "../config/env";

const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  auth: { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS },
});

const worker = new Worker(
  "emailQueue",
  async (job: Job) => {
    if (job.name === "orderConfirmation") {
      const { orderId, email, success, reason } = job.data as any;
      const subject = success ? `Order ${orderId} confirmed` : `Order ${orderId} failed`;
      const html = success
        ? `<p>Thank you! Your order ${orderId} is confirmed.</p>`
        : `<p>We could not process your order ${orderId}: ${reason}</p>`;

      await transporter.sendMail({
        from: ENV.SMTP_USER,
        to: email,
        subject,
        html,
      });

      console.log(`✉️ Sent order email to ${email} (order ${orderId})`);
    }
  },
  { connection: redis, concurrency: ENV.WORKER_CONCURRENCY_EMAIL }
);

worker.on("completed", (job) => console.log(`✅ Email job ${job.id} done`));
worker.on("failed", (job, err) => console.error(`❌ Email job failed:`, err));
