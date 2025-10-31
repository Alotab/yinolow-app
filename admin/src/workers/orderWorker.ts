// src/workers/orderWorker.ts
import { Worker, Job } from "bullmq";
// import { connection } from "../lib/redis";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { verifyPaymentIntent } from "../services/payment.service"; // implement to fetch PI by id
import { generateTrackingCode } from "../utils/generateTrackingCode";
import { enqueueOrderConfirmationEmail } from "../producers/emailProducer";
import { redis } from "../lib/redis";
import { ENV } from "../config/env";

const worker = new Worker(
  "orderQueue",
  async (job: Job) => {
    const { orderId, paymentIntentId } = job.data as { orderId: string; paymentIntentId?: string };

    const order = await Order.findById(orderId).exec();
    if (!order) throw new Error("Order not found");
    if (order.status === "paid") {
      // idempotency: do nothing if already processed
      return;
    }

    // Defensive: verify payment intent with gateway
    if (paymentIntentId) {
      const pi = await verifyPaymentIntent(paymentIntentId);
      if (!pi || pi.status !== "succeeded") {
        order.status = "failed";
        order.paymentResult = { verified: pi?.status ?? "unknown", raw: pi };
        await order.save();
        // notify user about failure
        await enqueueOrderConfirmationEmail({
          orderId: order._id.toString(),
          userId: order.userId,
          email: (order as any).userEmail || "",
          success: false,
          reason: "Payment not completed",
        });
        return;
      }
      // store verification result
      order.paymentResult = { verified: pi.status, raw: pi };
      await order.save();
    }

    // Validate stock and decrement
    for (const item of order.items) {
      const product = await Product.findById(item.productId).exec();
      if (!product) {
        order.status = "failed";
        await order.save();
        await enqueueOrderConfirmationEmail({
          orderId: order._id.toString(),
          userId: order.userId,
          email: (order as any).userEmail || "",
          success: false,
          reason: `Product ${item.productId} not found`,
        });
        return;
      }
      if ((product.stock ?? 0) < item.quantity) {
        order.status = "failed";
        await order.save();
        await enqueueOrderConfirmationEmail({
          orderId: order._id.toString(),
          userId: order.userId,
          email: (order as any).userEmail || "",
          success: false,
          reason: "Insufficient stock",
        });
        return;
      }
    }

    // Decrement stocks (non-transactional example; for production use DB transactions)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } }).exec();
    }

    // Generate unique tracking code
    let trackingCode = generateTrackingCode();
    // ensure unique (loop until unique)
    while (await Order.exists({ trackingCode })) {
      trackingCode = generateTrackingCode();
    }

    order.trackingCode = trackingCode;
    order.status = "paid";
    await order.save();

    // Clear cart in redis (best effort)
    try {
      await redis.del(`cart:user:${order.userId}`);
    } catch (e) {
      console.warn("Failed to clear user cart:", e);
    }

    // Enqueue email (confirmation + tracking code)
    await enqueueOrderConfirmationEmail({
      orderId: order._id.toString(),
      userId: order.userId,
      email: (order as any).userEmail || "",
      success: true,
      reason: "",
    });
  },
  {
    connection: redis,
    concurrency: ENV.WORKER_CONCURRENCY_ORDER || 3,
  }
);

worker.on("completed", (job) => console.log(`Order job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`Order job ${job?.id} failed:`, err));
























































// import { Worker, Job, QueueEvents } from "bullmq";
// import { redis } from "../lib/redis";

// import { ENV } from "../config/env";
// import { Order } from "../models/Order";
// import { Product } from "../models/Product";
// import { chargeCard } from "../services/payment.service";
// import { enqueueOrderConfirmationEmail } from "../producers/emailProducer";
// import { generateTrackingCode } from "../utils/generateTrackingCode";


// const worker = new Worker(
//   "orderQueue",
//   async (job: Job) => {
//     const { orderId, paymentMethodId } = job.data as { orderId: string; paymentMethodId?: string };

//     console.log(`🛠 [orderWorker] processing order ${orderId}`);

//     // 1) load order
//     const order = await Order.findById(orderId);
//     if (!order) throw new Error("Order not found");

//     if (order.status === "paid") {
//       console.log(`[orderWorker] order ${orderId} already paid`);
//       return;
//     }

//     // 2) Validate stock (simple synchronous check, for production use transactions/locking)
//     for (const item of order.items) {
//       const product = await Product.findById(item.productId);
//       if (!product) throw new Error(`Product ${item.productId} not found`);
//       if ((product.stock ?? 0) < item.quantity) {
//         // update order to failed due to stock
//         order.status = "failed";
//         await order.save();
//         // enqueue failure email
//         await enqueueOrderConfirmationEmail({
//           orderId: order._id.toString(),
//           userId: order.userId,
//           email: (order as any).userEmail || "", // if stored
//           success: false,
//           reason: "Insufficient stock",
//         });
//         throw new Error("Insufficient stock");
//       }
//     }

//     // 3) Attempt payment (if paymentMethodId provided)
//     try {
//       const amountCents = Math.round(order.total * 100);
//       if (!paymentMethodId) {
//         // You may support alternative cash-on-delivery flows; here we'll mark failed
//         throw new Error("No payment method provided");
//       }
//       const pi = await chargeCard({
//         amountCents,
//         paymentMethodId,
//         currency: "usd",
//         description: `Order ${order._id}`,
//         metadata: { orderId: order._id.toString() },
//       });

//       if (pi.status !== "succeeded") {
//         // Payment didn't succeed
//         order.status = "failed";
//         order.paymentResult = pi; // store raw response (careful with size)
//         await order.save();

//         // notify user
//         await enqueueOrderConfirmationEmail({
//           orderId: order._id.toString(),
//           userId: order.userId,
//           email: (order as any).userEmail || "",
//           success: false,
//           reason: `Payment ${pi.status}`,
//         });

//         throw new Error(`Payment status: ${pi.status}`);
//       }

//       // 4) Payment succeeded: update stock and order status (consider DB transaction)
//       for (const item of order.items) {
//         await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
//       }

//       // Generate and attach tracking code
//       let trackingCode = generateTrackingCode();

//       // Ensure uniqueness
//       while (await Order.exists({ trackingCode })){
//         trackingCode = generateTrackingCode();
//       }

//       order.trackingCode = trackingCode;
//       order.status = "paid";
//       order.paymentResult = { id: pi.id, status: pi.status };
//       await order.save();

//       // 5) Enqueue confirmation email
//       await enqueueOrderConfirmationEmail({
//         orderId: order._id.toString(),
//         userId: order.userId,
//         email: (order as any).userEmail || "",
//         success: true,
//         reason: "",
//       });

//       console.log(`✅ Order ${orderId} processed and paid`);
//     } catch (err) {
//       console.error(`[orderWorker] payment or processing error for ${orderId}`, err);
//       // If exception thrown above, it will trigger retry according to job options
//       throw err;
//     }
//   },
//   {
//     connection: redis,
//     concurrency: ENV.WORKER_CONCURRENCY_ORDER,
//   }
// );

// worker.on("completed", (job) => console.log(`✅ Order job ${job.id} completed`));
// worker.on("failed", (job, err) => console.error(`❌ Order job ${job?.id} failed:`, err));
