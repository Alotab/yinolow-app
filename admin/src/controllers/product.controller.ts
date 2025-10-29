// src/controllers/product.controller.ts
import { Request, Response } from "express";
import { Product } from "../models/Product";
import { logger } from "../utils/logger";


// Create product (admin only)
export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, sku, images, stock } = req.body;
    if (!name || price == null) return res.status(400).json({ message: "name and price required" });

    const p = new Product({ name, description, price, sku, images, stock });
    await p.save();
    logger.info("Product created successfully", p);
    return res.status(201).json({ product: p });
  } catch (err) {
    logger.error("Error creating product", err);
    // console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listProducts(req: Request, res: Response) {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ products });
  } catch (err) {
    logger.error("Error fetching products", err);
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ message: "Not found" });
    return res.json({ product: p });
  } catch (err) {
    console.error(err);
    logger.error("Error fetching product", err);
    return res.status(500).json({ message: "Server error" });
  }
}
