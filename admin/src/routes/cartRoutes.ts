import express from "express";
import * as cartControlller from "../controllers/cartController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authMiddleware); // protect all routes

router.post("/", cartControlller.addItem);                      // Add item to cart
router.get("/", cartControlller.getCart);                       // get user's cart
router.delete("/:productId", cartControlller.removeItem);       // Remove one item 
router.delete("/", cartControlller.clearCart);                  // clear entire cart


export default router;
