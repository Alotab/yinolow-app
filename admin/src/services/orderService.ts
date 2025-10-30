import { redis } from "../lib/redis";
import { Order } from "../models/Order";
import * as CartService from "./cartService";


export async function createOrderFromCart(userId: string) {
    const cart = await CartService.getCart(userId);

    if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty or expired");
    } 

    // calculate total
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // save order to MongoDB
    const order = await Order.create({
        userId,
        items: cart.items,
        total,
        status: "pending",
    });


    // Remove cart from Redis
    await redis.del(`cart:user:${userId}`);

    //return the newly created order
    return order
}