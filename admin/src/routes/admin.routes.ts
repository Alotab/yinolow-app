import { Router } from "express";
import { getAdminStats } from "../controllers/admin.controller";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/stats", authMiddleware, adminMiddleware, getAdminStats);

export default router;
