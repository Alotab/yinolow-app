import rateLimit from "express-rate-limit";
import RedisStore, { SendCommandFn } from "rate-limit-redis";
import { redis } from "../lib/redis";
import { Request, Response } from "express";
import { logger } from "../utils/logger";


const BLOCKED_IPS_KEY = "blocked:ips";
const BLOCK_DURATION = 60 * 60 * 6; // 6 hours

// ✅ Define sendCommand explicitly and cast to the correct type
const sendCommand: SendCommandFn = (...args: string[]) => {
  return redis.call(args[0], ...args.slice(1)) as Promise<any>;
};

const redisStore_apiLimiter = new RedisStore({
  sendCommand,
});

const redisStore_loginLimiter = new RedisStore({
  sendCommand,
});

/**
 * Helper: Block IP temporarily in Redis
 */
export async function blockIP(ip: string) {
  await redis.setex(`${BLOCKED_IPS_KEY}:${ip}`, BLOCK_DURATION, "1");
}

/**
 * Helper: Check if IP is blocked
 */
export async function isIPBlocked(ip: string) {
  return (await redis.exists(`${BLOCKED_IPS_KEY}:${ip}`)) === 1;
}

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore_apiLimiter,
  handler: async (req: Request, res: Response) => {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip;
    logger.warn(`🌐 API rate limit exceeded for IP: ${ip}`);
    await blockIP(ip);
    return res.status(429).json({
      success: false,
      message: "Too many requests — temporarily blocked.",
    });
  },
});

/**
 * Login/Signup specific limiter (stricter)
 */
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // only 5 tries in 10 minutes
  message: "Too many login attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore_loginLimiter,
  handler: async (req: Request, res: Response) => {
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip;

    logger.error(`🚨 Too many failed login attempts from IP: ${ip}`);
    await blockIP(ip);

    // You could enqueue an alert job here using BullMQ
    // Example: await alertQueue.add("ipBlocked", { ip });

    return res.status(429).json({
      success: false,
      message:
        "Too many login attempts. Your IP is temporarily blocked for security reasons.",
    });
  },
});

/**
 * Middleware to block known IPs (use before sensitive routes)
 */
export async function checkBlockedIP(req: Request, res: Response, next: Function) {
  const ip = (req.headers["x-forwarded-for"] as string) || req.ip;

  if (await isIPBlocked(ip)) {
    logger.warn(`🚫 Blocked request from blacklisted IP: ${ip}`);
    return res.status(403).json({
      success: false,
      message: "Your IP is temporarily blocked due to suspicious activity.",
    });
  }

  next();
}















// src/middlewares/rateLimiter.ts
// import rateLimit from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import { redis } from "../lib/redis";
// import { Request } from "express";

// ✅ Extract real IP (even behind proxies)
// function getClientIp(req: Request) {
//   const forwarded = req.headers["x-forwarded-for"];
//   if (typeof forwarded === "string") {
//     return forwarded.split(",")[0].trim();
//   }
//   return req.ip;
// }

// 🧱 General API limiter (e.g., product browsing, cart, etc.)
// export const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // max 100 requests per window
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: getClientIp
//   store: new RedisStore({
//     sendCommand: (...args: string[]) => redis.call(...args),
//   }),
//   message: {
//     success: false,
//     message: "Too many requests from this IP, please try again later.",
//   },
// });

// 🔐 Login limiter (stricter)
// export const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // max 5 attempts
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: getClientIp,
//   store: new RedisStore({
//     sendCommand: (...args: string[]) => redis.call(...args),
//   }),
//   message: {
//     success: false,
//     message: "Too many login attempts. Please try again after 15 minutes.",
//   },
// });


















































// import { Request, Response, NextFunction } from "express";
// import { redis } from "../lib/redis";
// import { RateLimiterRedis } from "rate-limiter-flexible";
// import { logger } from "../utils/logger";



// // configure the rate limiter 
// const rateLimiter = new RateLimiterRedis({
//     storeClient: redis,
//     keyPrefix: "middleware:rateLimiter",
//     points: 100,                                // Number of requests allowed
//     duration: 60 * 15,                          // Per 15 minutes window
//     blockDuration: 60 * 5                       // Block for 5 minutes if limit exceeded
// });

// export async function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
//     try {
//         // Use user ID if available, otherwise fallback to IP adddress
//         const key = req.user?.id || req.ip;

//         await rateLimiter.consume(key);

//         next();
//     } catch (rejRes: any) {
//         // Too many requests
//         logger.warn("Too many requests. Please try again later");
//         return res.status(429).json({
//             success: false,
//             message: "Too many requests. Please try again later",
//             retryAfter: rejRes.msBeforeNext / 1000,     // In seconds
//         })
//     }
// }