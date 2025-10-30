import express from "express";
import { checkout } from "../controllers/orderController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

router.post("/checkout", checkout);

export default router;