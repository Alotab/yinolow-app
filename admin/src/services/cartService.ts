import { date } from "joi";
import { redis } from "../lib/redis";

const CART_PREFIX = "cart:user:";
const CART_TTL = 60 * 60* 24 * 24       // 24 HOURS

export interface CartItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Cart {
    items: CartItem[];
    updateAt: number;
}

export async function addToCart(userId: string, item: CartItem) {
    const key = `${CART_PREFIX}${userId}`;
    const cache = await redis.get(key);

    let cart: Cart = cache ? JSON.parse(cache) :{ items: [], updateAt: Date.now() };

    // find if items exists already
    const existing = cart.items.find((i) => i.productId === item.productId);

    if (existing) {
        existing.quantity += item.quantity;
    } else {
        cart.items.push(item)
    }

    cart.updateAt = Date.now();
    await redis.set(key, JSON.stringify(cart), "EX", CART_TTL);

    return cart;

}


// Get cart
export async function getCart(userId: string): Promise<Cart | null>{
    const key = `${CART_PREFIX}${userId}`;
    const cache = await redis.get(key);
    return cache ? JSON.parse(cache) : null
}

// remove an item from cart
export async function removeItem(userId: string, productId: string) {
    const key = `${CART_PREFIX}${userId}`;
    const cache = await redis.get(key);
    if (!cache) return null;


    let cart: Cart = JSON.parse(cache);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.updateAt = Date.now();

    await redis.set(key, JSON.stringify(cart), "EX", CART_TTL);
    return cart;
}


// clear entire cart
export async function clearCart(userId: string) {
    const key = `${CART_PREFIX}${userId}`;
    await redis.del(key)
}
