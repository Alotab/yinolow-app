import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or malformed",
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not set in environment variables");

    // ✅ Decode and verify token
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
      iat?: number;
      exp?: number;
    };

    // ✅ Attach decoded payload to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/** ✅ Restrict access to admins only */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user data found in request",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admins only",
      });
    }

    next();
  } catch (err) {
    console.error("Admin Middleware Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error verifying admin role",
    });
  }
};



// 2️⃣ Authorize admin-only access --- compare later
// export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
//   const user = (req as any).user;
//   if (!user || user.role !== "admin") {
//     return res.status(403).json({ message: "Access denied: admin only" });
//   }
//   next();
// }
