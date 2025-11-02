// src/routes/wishlist.routes.ts
import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  mergeGuestWishlist
} from "../controllers/wishlist.controller";

const router = express.Router();

// These would typically be protected routes (require login)
router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.post("/merge", mergeGuestWishlist);

export default router;



// GET /api/wishlist
// POST /api/wishlist/:productId when heart is clicked
// DELETE /api/wishlist/:productId
