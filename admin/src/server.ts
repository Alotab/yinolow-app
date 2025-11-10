import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { getIO, initSocket } from "./socket";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";
import { connectDB } from "./lib/db";
import { redis as redisSub } from "./lib/redis";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import orderStatusRoutes from "./routes/orderStatus.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import adminRoutes from "./routes/admin.routes";
import { apiLimiter, loginLimiter, checkBlockedIP } from "./middlewares/rateLimiter";

dotenv.config();

const app = express();
app.set("trust proxy", true);
app.use(checkBlockedIP);
app.use("/api", apiLimiter);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", loginLimiter);
app.use("/api/auth/forgot-password", loginLimiter);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orders", orderStatusRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

// error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT || 4000);
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// 🔔 Subscribe to Redis *after* socket is initialized
// redisSub.subscribe("order_updates", (message) => {
//   const data = JSON.parse(message);
//   const io = getIO();

//   if (data.type === "ORDER_PAID") {
//     io.to(`user:${data.userId}`).emit("order:paid", data);
//     io.to("admins").emit("admin:orderUpdate", data);
//   }
// });

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server started on http://localhost:${PORT}`);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
