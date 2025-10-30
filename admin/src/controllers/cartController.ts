import { Request, Response } from "express";
import * as CartService from "../services/cartService";
import { logger } from "../utils/logger";

export const addItem = async (req: Request, res: Response) => {
    logger.info("Adding item to cart...");
    try {
        const userId = req.user.id;  // from auth middleware
        const item = req.body;
        const cart = await CartService.addToart(userId, item);
        res.status(200).json({ success: true, cart });
    } catch (err) {
        logger.error("Add to cart error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const cart = await CartService.getCart(userId);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const removeItem = async (req: Request, res: Response) => {
    try{
        const userId = req.user.id;
        const { productId } = req.params;
        const cart = await CartService.removeItem(userId, productId);
        res.status(200).json({ success: true, cart});
    } catch (err){
        logger.error("Remove item error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error"});
    }
}

export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        await CartService.clearCart(userId);
        logger.info("Cart successfuly cleared");
        res.status(200).json({ 
            success: true,
            message: "Cart cleared"
        });
    } catch (err){
        logger.error("Clear cart error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};