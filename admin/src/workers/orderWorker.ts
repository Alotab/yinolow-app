// src/workers/orderWorker.ts
import { Worker, Job } from "bullmq";
import mongoose from "mongoose";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { verifyPaymentIntent } from "../services/payment.service";
import { generateTrackingCode } from "../utils/generateTrackingCode";
import { enqueueOrderConfirmationEmail } from "../producers/emailProducer";
import { redis } from "../lib/redis";
import { ENV } from "../config/env";

const worker = new Worker(
  "orderQueue",
  async (job: Job) => {
    const { orderId, paymentIntentId } = job.data as {
      orderId: string;
      paymentIntentId?: string;
    };

    console.log(`🔧 Processing order job: ${orderId}`);

    // --- 1️⃣ Load the order
    const order = await Order.findById(orderId).exec();
    if (!order) throw new Error("Order not found");

    // Idempotency check — if already processed, skip
    if (order.status === "paid") {
      console.log(`⚠️ Order ${orderId} already processed.`);
      return;
    }

    // --- 2️⃣ Verify payment with gateway (Stripe/Paystack etc.)
    if (paymentIntentId) {
      const pi = await verifyPaymentIntent(paymentIntentId);
      if (!pi || pi.status !== "succeeded") {
        order.status = "failed";
        order.paymentResult = { verified: pi?.status ?? "unknown", raw: pi };
        await order.save();

        await enqueueOrderConfirmationEmail({
          orderId: order._id.toString(),
          userId: order.userId,
          email: (order as any).userEmail || "",
          success: false,
          reason: "Payment verification failed",
        });
        console.log(`❌ Payment failed for order ${orderId}`);
        return;
      }

      order.paymentResult = { verified: pi.status, raw: pi };
      await order.save();
    }

    // --- 3️⃣ Validate stock before deduction
    for (const item of order.items) {
      const product = await Product.findById(item.productId).exec();
      if (!product) {
        await markOrderFailed(order, `Product ${item.productId} not found`);
        return;
      }

      if ((product.stock ?? 0) < item.quantity) {
        await markOrderFailed(order, `Insufficient stock for ${product.name}`);
        return;
      }
    }

    // --- 4️⃣ Begin MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // --- 5️⃣ Deduct stock atomically
      for (const item of order.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );

        if (!updated) {
          throw new Error(`Stock deduction failed for product ${item.productId}`);
        }

        // Invalidate product caches (keep frontend in sync)
        await redis.del(`product:${item.productId}`);
      }

      // --- 6️⃣ Generate unique tracking code
      let trackingCode = generateTrackingCode();
      while (await Order.exists({ trackingCode })) {
        trackingCode = generateTrackingCode();
      }

      // --- 7️⃣ Update order info
      order.trackingCode = trackingCode;
      order.status = "paid";
      await order.save({ session });

      // Commit transaction
      await session.commitTransaction();
      console.log(`✅ Order ${orderId} processed successfully.`);

      // Clear cart in Redis (best effort)
      try {
        await redis.del(`cart:user:${order.userId}`);
      } catch (e) {
        console.warn("⚠️ Failed to clear user cart:", e);
      }

      // Invalidate order-related cache
      await redis.del(`order:status:${order.orderNumber}`);
      await redis.del(`order:status:${order.trackingCode}`);

      // Send success email
      await enqueueOrderConfirmationEmail({
        orderId: order._id.toString(),
        userId: order.userId,
        email: (order as any).userEmail || "",
        success: true,
        reason: "",
      });
    } catch (err) {
      await session.abortTransaction();
      console.error(`❌ Error processing order ${orderId}:`, err);
      await markOrderFailed(order, err instanceof Error ? err.message : "Unknown error");
    } finally {
      session.endSession();
    }
  },
  {
    connection: redis,
    concurrency: ENV.WORKER_CONCURRENCY_ORDER || 3,
  }
);

// --- 8️⃣ Helper: mark order as failed + notify user
async function markOrderFailed(order: any, reason: string) {
  order.status = "failed";
  await order.save();

  await enqueueOrderConfirmationEmail({
    orderId: order._id.toString(),
    userId: order.userId,
    email: (order as any).userEmail || "",
    success: false,
    reason,
  });

  console.log(`❌ Order ${order._id} failed: ${reason}`);
}

worker.on("completed", (job) =>
  console.log(`🎉 Order job ${job.id} completed successfully`)
);
worker.on("failed", (job, err) =>
  console.error(`💥 Order job ${job?.id} failed:`, err)
);


























// src/workers/orderWorker.ts
// import { Worker, Job } from "bullmq";
// import { Order } from "../models/Order";
// import { Product } from "../models/Product";
// import { verifyPaymentIntent } from "../services/payment.service"; // implement to fetch PI by id
// import { generateTrackingCode } from "../utils/generateTrackingCode";
// import { enqueueOrderConfirmationEmail } from "../producers/emailProducer";
// import { redis } from "../lib/redis";
// import { ENV } from "../config/env";
// import mongoose from "mongoose";



// const worker = new Worker(
//   "orderQueue",
//   async (job: Job) => {
//     const { orderId, paymentIntentId } = job.data as { orderId: string; paymentIntentId?: string };

//     const order = await Order.findById(orderId).exec();
//     if (!order) throw new Error("Order not found");
//     if (order.status === "paid") {
//       // idempotency: do nothing if already processed
//       return;
//     }

//     // Defensive: verify payment intent with gateway
//     if (paymentIntentId) {
//       const pi = await verifyPaymentIntent(paymentIntentId);
//       if (!pi || pi.status !== "succeeded") {
//         order.status = "failed";
//         order.paymentResult = { verified: pi?.status ?? "unknown", raw: pi };
//         await order.save();
//         // notify user about failure
//         await enqueueOrderConfirmationEmail({
//           orderId: order._id.toString(),
//           userId: order.userId,
//           email: (order as any).userEmail || "",
//           success: false,
//           reason: "Payment not completed",
//         });
//         return;
//       }
//       // store verification result
//       order.paymentResult = { verified: pi.status, raw: pi };
//       await order.save();
//     }

//     // Validate stock and decrement
//     for (const item of order.items) {
//       const product = await Product.findById(item.productId).exec();
//       if (!product) {
//         order.status = "failed";
//         await order.save();
//         await enqueueOrderConfirmationEmail({
//           orderId: order._id.toString(),
//           userId: order.userId,
//           email: (order as any).userEmail || "",
//           success: false,
//           reason: `Product ${item.productId} not found`,
//         });
//         return;
//       }
//       if ((product.stock ?? 0) < item.quantity) {
//         order.status = "failed";
//         await order.save();
//         await enqueueOrderConfirmationEmail({
//           orderId: order._id.toString(),
//           userId: order.userId,
//           email: (order as any).userEmail || "",
//           success: false,
//           reason: "Insufficient stock",
//         });
//         return;
//       }
//     }

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     // Decrement stocks (non-transactional example; for production use DB transactions)
//     for (const item of order.items) {
//       await Product.findByIdAndUpdate(
//         item.productId, 
//         { $inc: { stock: -item.quantity } },
//         { session }
//       );
//     }

//     // Generate unique tracking code
//     let trackingCode = generateTrackingCode();
//     // ensure unique (loop until unique)
//     while (await Order.exists({ trackingCode })) {
//       trackingCode = generateTrackingCode();
//     }

//     order.trackingCode = trackingCode;
//     order.status = "paid";
//     await order.save({ session });

//     // Clear cart in redis (best effort)
//     try {
//       await redis.del(`cart:user:${order.userId}`);
//     } catch (e) {
//       console.warn("Failed to clear user cart:", e);
//     }

//     // Enqueue email (confirmation + tracking code)
//     await enqueueOrderConfirmationEmail({
//       orderId: order._id.toString(),
//       userId: order.userId,
//       email: (order as any).userEmail || "",
//       success: true,
//       reason: "",
//     });
//   },
//   {
//     connection: redis,
//     concurrency: ENV.WORKER_CONCURRENCY_ORDER || 3,
//   }
// );

// worker.on("completed", (job) => console.log(`Order job ${job.id} completed`));
// worker.on("failed", (job, err) => console.error(`Order job ${job?.id} failed:`, err));
