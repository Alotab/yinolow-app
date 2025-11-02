
import express from "express";
const cors = require("cors");
import helmet from "helmet";
import dotenv from "dotenv";
// import "express-async-errors";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";
import { connectDB } from "./lib/db";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import { apiLimiter, loginLimiter, checkBlockedIP } from "./middlewares/rateLimiter";
import orderStatusRoutes from "./routes/orderStatus.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config();


const app = express();

// Make sure Express uses real IPs behind proxies
app.set("trust proxy", true);

// Block any known bad IPs early
app.use(checkBlockedIP);

// Apply general API limiter to all routes
app.use("/api", apiLimiter);

app.use(helmet());
app.use(cors());
app.use(express.json())

// Apply stricter rate limiter only to login/register endpoints
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
app.use(errorHandler)

const PORT = Number(process.env.PORT || 4000);

connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`🚀 Server started on http://localhost:${PORT}`)
    });
});


// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});