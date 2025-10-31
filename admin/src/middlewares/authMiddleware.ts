import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user object
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or malformed",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET not set in environment variables");
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded; // decoded should contain user info (e.g., { id, email })

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
