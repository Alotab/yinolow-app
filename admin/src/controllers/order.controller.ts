import { Request, Response } from "express";
import { Order } from "../models/Order";
import { enqueueProcessOrder } from "../producers/orderProducer";
import * as CartService from "../services/cartService";
import { redis } from "../lib/redis";



/**
 * Client calls POST /api/order/checkout with paymentMethodId (or payment token) and shipping info.
 * We:
 *  - read cart from Redis,
 *  - create Order in DB with status 'pending',
 *  - enqueue processOrder job (handles payment & completion),
 *  - return 202 Accepted with order id (and optionally redirect to payment UI).
 */
export async function checkout(req: Request, res: Response) {
  try {
    const userId = req.user.id; // assume auth middleware sets req.user
    const { paymentMethodId, shipping } = req.body;

    // 1) Get cart from redis
    const cart = await CartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2) Compute total (recompute prices on server in production)
    const total = cart.items.reduce((s, it) => s + it.price * it.quantity, 0);

    // 3) Create Order in DB (status: pending)
    const order = await Order.create({
      userId,
      items: cart.items,
      total,
      status: "pending",
      shipping,
    });

    // 4) Enqueue background job to process payment & finalize order
    await enqueueProcessOrder({
      orderId: order._id.toString(),
      paymentMethodId, // keep minimal payload
    });

    // 5) Optionally keep cart until job completes — but you may clear it immediately:
    // await redis.del(`cart:user:${userId}`);

    // 6) Respond fast
    return res.status(202).json({ message: "Order received", orderId: order._id });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
