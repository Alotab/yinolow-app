// src/controllers/orderStatus.controller.ts
import { Request, Response } from "express";
import { Order } from "../models/Order";

export async function getOrderStatus(req: Request, res: Response) {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).select("orderNumber status trackingCode total items createdAt").exec();
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    return res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingCode: order.trackingCode,
        total: order.total,
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("getOrderStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
