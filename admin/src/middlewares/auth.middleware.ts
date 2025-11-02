import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User"
import { isAccessTokenBlacklisted } from "../controllers/auth.tokens";
const logger = require("../utils/logger");

dotenv.config();

const JWt_SECRET = process.env.JWT_SECRET || "change_this";

export interface AuthRequest extends Request {
    user?: any
};

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token missing "});

        // const payload = jwt.verify(token, JWt_SECRET) as { id: string; iat?: number; exp?: number};

        let payload: any;
        try {
            payload = jwt.verify(token, JWt_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // check blacklist
        if (payload.jti) {
            const isBlacklisted = await isAccessTokenBlacklisted(payload.jti);
            if (isBlacklisted) return res.status(401).json({ message: "Token revoked" });
        }

        const user = await User.findById(payload.id).select("-password");
        if (!user) return res.status(401).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        logger.warn("Unauthorized access");
        return res.status(401).json({ message: "Unauthorized", error: (err as Error)})
        
    }
};

export function requireRole(role: "admin" | "user") {
    return (req: AuthRequest, res: Response, next: NextFunction) =>{
        const user = req.user;
        if (!user) {
            logger.warn("Unautnorized access")
            return res.status(401).json({
                message: "Unauthorized"
            });
        };
        if (user.role !== role) {
            logger.warn("User forbidden from accessing this endpoint")
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        next();
    }
};