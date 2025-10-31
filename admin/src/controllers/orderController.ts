import { Request, Response } from "express";
import * as OrderService from "../services/orderService"
import { logger } from "../utils/logger";
import { Order } from "../models/Order";


export const checkout = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const order = await OrderService.createOrderFromCart(userId);

        logger.info("Order created successsfully")
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order,
        });
    } catch (err: any){
        logger.error("Checkout error:", err);
        res.status(400).json({
            success: false,
            message: err.message || "Checkout Failed",
        });
    }
};


export const getOrderByTrackingCode = async (req: Request, res: Response) => {
  try {
    const { trackingCode } = req.params;
    const order = await Order.findOne({ trackingCode });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      orderId: order._id,
      status: order.status,
      items: order.items,
      total: order.total,
      trackingCode: order.trackingCode,
    });
  } catch (err) {
    console.error("Error fetching order by tracking code:", err);
    res.status(500).json({ message: "Server error" });
  }
};