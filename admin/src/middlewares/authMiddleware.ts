import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Simulated user (replace with decoded JWT user info)
  req.user = { id: "user_12345" };
  next();
};