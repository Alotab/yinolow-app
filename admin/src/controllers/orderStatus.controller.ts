// src/controllers/orderStatus.controller.ts
import { Request, Response } from "express";
import { Order } from "../models/Order";
import { redis } from "../lib/redis";

export async function getOrderStatus(req: Request, res: Response) {
  try {
    const { code, order } = req.query;

    if (!code && !order) {
      return res.status(400).json({
        success: false,
        message: "Please provide either tracking code or order number.",
      });
    }

    const identifier = code || order;
    const cacheKey = `order:status:${identifier}`;

    // 1️⃣ Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        order: JSON.parse(cached),
      });
    }

    // 2️⃣ Fallback to MongoDB lookup
    const query = code
      ? { trackingCode: code }
      : { orderNumber: order };

    const orderDoc = await Order.findOne(query)
      .select("orderNumber trackingCode total items status createdAt")
      .exec();

    if (!orderDoc) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 3️⃣ Add a friendly message
    let message = "";
    switch (orderDoc.status) {
      case "processing":
        message = "Your order is being processed.";
        break;
      case "paid":
        message = "Your payment was successful! Preparing your shipment.";
        break;
      case "failed":
        message = "Payment failed. Please try again.";
        break;
      case "shipped":
        message = "Your order has been shipped.";
        break;
      case "delivered":
        message = "Your order has been delivered. Thank you!";
        break;
      default:
        message = "Order status unknown.";
        break;
    }

    const responseData = {
      orderNumber: orderDoc.orderNumber,
      trackingCode: orderDoc.trackingCode,
      status: orderDoc.status,
      total: orderDoc.total,
      items: orderDoc.items,
      createdAt: orderDoc.createdAt,
      message,
    };

    // 4️⃣ Cache for 5 mins
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60 * 5);

    return res.json({
      success: true,
      source: "db",
      order: responseData,
    });
  } catch (err) {
    console.error("getOrderStatus error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order status",
    });
  }
}














// src/controllers/orderStatus.controller.ts
// import { Request, Response } from "express";
// import { Order } from "../models/Order";
// import { redis } from "../lib/redis";

// export async function getOrderStatus(req: Request, res: Response) {
//   try {
//     const { code, order } = req.query;

//     if (!code && !order) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide either tracking code or order number.",
//       });
//     }

//     const identifier = code || order;
//     const cacheKey = `order:status:${identifier}`;

//     // 1️⃣ Try Redis cache first
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return res.json({
//         success: true,
//         source: "cache",
//         order: JSON.parse(cached),
//       });
//     }

//     // 2️⃣ Fallback to MongoDB lookup
//     const query = code
//       ? { trackingCode: code }
//       : { orderNumber: order };

//     const orderDoc = await Order.findOne(query)
//       .select("orderNumber trackingCode total items status createdAt")
//       .exec();

//     if (!orderDoc) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // 3️⃣ Add a friendly message
//     let message = "";
//     switch (orderDoc.status) {
//       case "pending":
//         message = "Your order is being processed.";
//         break;
//       case "paid":
//         message = "Your payment was successful! Preparing your shipment.";
//         break;
//       case "failed":
//         message = "Payment failed. Please try again.";
//         break;
//       case "shipped":
//         message = "Your order has been shipped.";
//         break;
//       case "delivered":
//         message = "Your order has been delivered. Thank you!";
//         break;
//       default:
//         message = "Order status unknown.";
//         break;
//     }

//     const responseData = {
//       orderNumber: orderDoc.orderNumber,
//       trackingCode: orderDoc.trackingCode,
//       status: orderDoc.status,
//       total: orderDoc.total,
//       items: orderDoc.items,
//       createdAt: orderDoc.createdAt,
//       message,
//     };

//     // 4️⃣ Cache for 5 mins
//     await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60 * 5);

//     return res.json({
//       success: true,
//       source: "db",
//       order: responseData,
//     });
//   } catch (err) {
//     console.error("getOrderStatus error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching order status",
//     });
//   }
// }













// src/controllers/orderStatus.controller.ts
// import { Request, Response } from "express";
// import { Order } from "../models/Order";
// import { redis } from "../lib/redis";

// export async function getOrderStatus(req: Request, res: Response) {
//   try {
//     const { orderNumber, orderId } = req.params;
//     const cacheKey = orderNumber
//       ? `order:status:${orderNumber}`
//       : orderId
//       ? `order:status:${orderId}`
//       : null;

//     let order = null;

//     // 1️⃣ Check Redis first for cached order status
//     if (cacheKey) {
//       const cached = await redis.get(cacheKey);
//       if (cached) {
//         return res.json({
//           success: true,
//           source: "cache",
//           order: JSON.parse(cached),
//         });
//       }
//     }

//     // 2️⃣ Fallback to MongoDB lookup
//     if (orderNumber) {
//       order = await Order.findOne({ orderNumber })
//         .select("orderNumber trackingCode total items status createdAt")
//         .exec();
//     } else if (orderId) {
//       order = await Order.findById(orderId)
//         .select("orderNumber trackingCode total items status createdAt")
//         .exec();
//     }

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // 3️⃣ Generate a friendly progress message
//     let message = "";
//     switch (order.status) {
//       case "pending":
//         message = "Your order is being processed. Please check again soon.";
//         break;
//       case "paid":
//         message = "Your payment was successful! You will receive your tracking code shortly.";
//         break;
//       case "failed":
//         message = "Payment failed. Please try again or contact support.";
//         break;
//       case "shipped":
//         message = "Your order has been shipped.";
//         break;
//       case "delivered":
//         message = "Your order has been delivered. Thank you!";
//         break;
//       default:
//         message = "Order status unknown.";
//         break;
//     }

//     const responseData = {
//       orderId: order._id,
//       orderNumber: order.orderNumber,
//       status: order.status,
//       trackingCode: order.trackingCode,
//       total: order.total,
//       items: order.items,
//       createdAt: order.createdAt,
//       message,
//     };

//     // 4️⃣ Cache order status in Redis (short TTL for freshness)
//     if (cacheKey) {
//       await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60 * 5); // cache 5 mins
//     }

//     return res.json({
//       success: true,
//       source: "db",
//       order: responseData,
//     });
//   } catch (err) {
//     console.error("getOrderStatus error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching order status",
//     });
//   }
// }



















// import { Request, Response } from "express";
// import { Order } from "../models/Order";

// export async function getOrderStatus(req: Request, res: Response) {
//   try {
//     const { orderNumber } = req.params;
//     const order = await Order.findOne({ orderNumber }).select("orderNumber status trackingCode total items createdAt").exec();
//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     return res.json({
//       success: true,
//       order: {
//         orderNumber: order.orderNumber,
//         status: order.status,
//         trackingCode: order.trackingCode,
//         total: order.total,
//         items: order.items,
//         createdAt: order.createdAt,
//       },
//     });
//   } catch (err) {
//     console.error("getOrderStatus error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// }
