// src/routes/product.routes.ts
import { Router } from "express";
import { createProduct, listProducts, getProduct } from "../controllers/product.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);

// admin-only create
router.post("/", requireAuth, requireRole("admin"), createProduct);

export default router;
