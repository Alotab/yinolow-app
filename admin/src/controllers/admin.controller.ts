import { Request, Response } from "express";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { logger } from "../utils/logger";

/**
 * GET /api/admin/stats
 * Summary dashboard for admins
 */
export async function getAdminStats(req: Request, res: Response) {
  try {
    // 🧮 Count users
    const totalUsers = await User.countDocuments();

    // 🧮 Orders + revenue aggregation
    const [orderStats] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    // 🚨 Count failed payments
    const failedPayments = await Order.countDocuments({ status: "failed" });

    // 📅 Recent 5 orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id amount status createdAt");

    res.json({
      totalUsers,
      totalOrders: orderStats?.totalOrders || 0,
      totalRevenue: orderStats?.totalRevenue || 0,
      failedPayments,
      recentOrders,
    });
  } catch (err) {
    logger.error("Error fetching admin stats", err);
    res.status(500).json({ message: "Server error" });
  }
}
