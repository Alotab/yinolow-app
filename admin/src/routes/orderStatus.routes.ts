// src/routes/order.routes.ts
import express from "express";
import { getOrderStatus } from "../controllers/orderStatus.controller";


const router = express.Router();

// router.get("/:trackingCode/status", getOrderStatus);
router.get("/track", getOrderStatus);   // Track by code or Order number

export default router;


// Endpoints
/**
 *  fetch(`/api/orders/track?order=${orderNumber}`);
 *  fetch(`/api/orders/track?code=${trackingCode}`);

 */