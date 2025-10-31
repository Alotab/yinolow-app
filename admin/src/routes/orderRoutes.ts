import express from "express";
import { checkout, getOrderByTrackingCode } from "../controllers/orderController";
import { authMiddleware } from "../middlewares/authMiddleware";


const router = express.Router();

router.use(authMiddleware);


router.post("/checkout", checkout);
router.get("/track/:trackingCode", getOrderByTrackingCode);  // Expose a public route for tracking Orders

export default router;