// src/controllers/wishlist.controller.ts
import { Request, Response } from "express";
import { Wishlist } from "../models/Wishlist";
import { Product } from "../models/Product";
import { redis } from "../lib/redis";
import { logger } from "../utils/logger";
import mongoose from "mongoose";


const WISHLIST_CACHE_KEY = (userId: string) => `wishlist:user:${userId}`;
const GUEST_WISHLIST_KEY = (sessionId: string) => `wishlist:guest:${sessionId}`;

// Add product to wishlist
export async function addToWishlist(req: Request, res: Response) {
  try {
    const userId = req.user?.id || "guest"; // adapt based on your auth logic
    const { productId } = req.params;

    // Check if product exists
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return res.status(404).json({ message: "Product not found" });

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId }] });
    } else {
      // Prevent duplicates
      const exists = wishlist.items.some(item => item.productId.toString() === productId);
      if (!exists) wishlist.items.push({ productId });
    }

    await wishlist.save();
    await redis.del(WISHLIST_CACHE_KEY(userId));

    res.json({ success: true, wishlist });
  } catch (err) {
    logger.error("Error adding to wishlist", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Remove product from wishlist
export async function removeFromWishlist(req: Request, res: Response) {
  try {
    const userId = req.user?.id || "guest";
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    await redis.del(WISHLIST_CACHE_KEY(userId));

    res.json({ success: true, wishlist });
  } catch (err) {
    logger.error("Error removing from wishlist", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Get user wishlist
export async function getWishlist(req: Request, res: Response) {
  try {
    const userId = req.user?.id || "guest";

    const cache = await redis.get(WISHLIST_CACHE_KEY(userId));
    if (cache) {
      logger.info(`Serving wishlist for ${userId} from cache`);
      return res.json(JSON.parse(cache));
    }

    const wishlist = await Wishlist.findOne({ userId }).populate("items.productId");
    const response = wishlist || { userId, items: [] };

    await redis.set(WISHLIST_CACHE_KEY(userId), JSON.stringify(response), "EX", 600);

    res.json(response);
  } catch (err) {
    logger.error("Error fetching wishlist", err);
    res.status(500).json({ message: "Server error" });
  }
}


/**
 * Merge guest wishlist (from Redis) into logged-in user's wishlist
 * Called after user logs in — merges temporary wishlist from Redis (guest)
 * into MongoDB wishlist for that user.
 */
export async function mergeGuestWishlist(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { guestId } = req.body; // send from frontend cookie/localStorage

    if (!userId || !guestId) {
      return res.status(400).json({ message: "Missing userId or sessionId" });
    }

    // 1️⃣ Fetch guest wishlist from Redis
    const guestCache = await redis.get(GUEST_WISHLIST_KEY(guestId));
    if (!guestCache) {
      return res.json({ success: true, message: "No guest wishlist found" });
    }

    const guestWishlist = JSON.parse(guestCache) as {
      items: { productId: string }[];
    };

    // 2️⃣ Fetch (or create) user's wishlist in DB
    let userWishlist = await Wishlist.findOne({ userId });
    if (!userWishlist) {
      userWishlist = new Wishlist({ userId, items: [] });
    }

    // 3️⃣ Prepare a Set for existing product IDs (to avoid duplicates)
    const userSet = new Set(userWishlist.items.map(i => i.productId.toString()));

    // 4️⃣ Merge guest items safely
    for (const item of guestWishlist.items) {
      if (!userSet.has(item.productId)) {
        userWishlist.items.push({
          productId: new mongoose.Types.ObjectId(item.productId),
          addedAt: new Date(),
        });
      }
    }

    // 5️⃣ Save updated wishlist
    await userWishlist.save();

    // 6️⃣ Cleanup Redis cache
    await Promise.all([
      redis.del(GUEST_WISHLIST_KEY(sessionId)),
      redis.del(WISHLIST_CACHE_KEY(userId)),
    ]);

    res.json({
      success: true,
      message: "Guest wishlist merged successfully",
      wishlist: userWishlist,
    });
  } catch (err) {
    logger.error("Error merging guest wishlist", err);
    res.status(500).json({ message: "Server error" });
  }
}