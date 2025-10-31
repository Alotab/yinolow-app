// src/controllers/order.controller.ts
import { Request, Response } from "express";
import { Order } from "../models/Order";
import * as CartService from "../services/cartService";
import { enqueuePostPaymentJob } from "../producers/orderProducer";
import { generateOrderNumber } from "../utils/generateOrderNumber";
import { chargeCard } from "../services/payment.service";

export async function checkout(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const { paymentMethodId, shipping } = req.body;

    // 1) Get cart from redis
    const cart = await CartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // 2) Recompute total server-side
    const total = cart.items.reduce((s, it) => s + it.price * it.quantity, 0);

    // 3) Generate orderNumber and create order in DB as processing
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId,
      items: cart.items,
      total,
      status: "processing",
      shipping,
    });

    // 4) Charge synchronously (use idempotency key)
    // chargeCard should accept idempotencyKey param that is forwarded to Stripe/etc.
    const paymentResponse = await chargeCard({
      amountCents: Math.round(total * 100),
      paymentMethodId,
      currency: "usd",
      description: `Order ${order._id}`,
      metadata: { orderId: order._id.toString() },
      idempotencyKey: orderNumber, // IMPORTANT: prevents double charge
    });

    // Save payment reference on order (even if pending)
    if (paymentResponse?.id) {
      order.paymentIntentId = paymentResponse.id;
    }
    // store raw minimal payment result
    order.paymentResult = { id: paymentResponse?.id, status: paymentResponse?.status };
    await order.save();

    // 5) If payment failed synchronously — mark and return failure
    if (paymentResponse?.status !== "succeeded") {
      order.status = "failed";
      await order.save();
      return res.status(400).json({ success: false, message: "Payment failed", details: paymentResponse });
    }

    // 6) Payment succeeded synchronously — enqueue post-payment job for heavy tasks
    await enqueuePostPaymentJob({ orderId: order._id.toString(), paymentIntentId: paymentResponse.id });

    // 7) Optional: keep the cart until post-payment processing finishes or clear immediately
    // await redis.del(`cart:user:${userId}`);

    // 8) Immediate response to user — show order number & basic success
    return res.status(200).json({
      success: true,
      message: "Payment successful. Finalizing your order.",
      orderId: order._id,
      orderNumber,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}










































// import { Request, Response } from "express";
// import { Order } from "../models/Order";
// import { enqueuePostPaymentJob } from "../producers/orderProducer";
// import * as CartService from "../services/cartService";
// // import { redis } from "../lib/redis";


// /**
//  * Client calls POST /api/order/checkout with paymentMethodId (or payment token) and shipping info.
//  * We:
//  *  - read cart from Redis,
//  *  - create Order in DB with status 'pending',
//  *  - enqueue processOrder job (handles payment & completion),
//  *  - return 202 Accepted with order id (and optionally redirect to payment UI).
//  */
// export async function checkout(req: Request, res: Response) {
//   try {
//     const userId = req.user.id; // assume auth middleware sets req.user
//     const { paymentIntentId, shipping } = req.body;

//     // 1) Get cart from redis
//     const cart = await CartService.getCart(userId);
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // 2) Compute total (recompute prices on server in production)
//     const total = cart.items.reduce((s, it) => s + it.price * it.quantity, 0);

//     // 3) Create Order in DB (status: pending)
//     const order = await Order.create({
//       userId,
//       items: cart.items,
//       total,
//       status: "pending",
//       shipping,
//     });

//     // 4) Enqueue background job to process payment & finalize order
//     await enqueuePostPaymentJob({
//       orderId: order._id.toString(),
//       paymentIntentId, // keep minimal payload
//     });

//     // 5) Optionally keep cart until job completes — but you may clear it immediately:
//     // await redis.del(`cart:user:${userId}`);

//     // 6) Respond fast
//     return res.status(202).json({ message: "Order received", orderId: order._id });
//   } catch (err) {
//     console.error("Checkout error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// }




