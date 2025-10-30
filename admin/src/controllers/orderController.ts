import { Request, Response } from "express";
import * as OrderService from "../services/orderService"
import { logger } from "../utils/logger";


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