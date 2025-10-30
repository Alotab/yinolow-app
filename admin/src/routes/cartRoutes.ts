import express from "express";
import * as cartControlller from "../controllers/cartController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authMiddleware); // protect all routes

router.post("/", cartControlller.addItem);
router.post("/", cartControlller.getCart);
router.delete("/:productId", cartControlller.removeItem);
router.delete("/", cartControlller.clearCart);


export default router;
