// src/routes/order.routes.ts
import express from "express";
import { getOrderStatus } from "../controllers/orderStatus.controller";


const router = express.Router();

router.get("/status/:orderNumber", getOrderStatus);

export default router;
