// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, me, refreshToken, logout } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";


const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
