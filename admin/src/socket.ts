
import { Server as IOServer } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import type { Server as HTTPServer } from "http";

let io: IOServer | null = null;

export function initSocket(httpServer: HTTPServer) {
  if (io) return io; // already initialized

  io = new IOServer(httpServer, {
    cors: {
      origin: "*", // lock this down in prod to your frontend origin
      methods: ["GET", "POST"]
    },
    // pingTimeout / other options can be configured here
  });

  // Redis adapter for multi-process scaling (requires REDIS_URL env)
  const pubClient = createClient({ url: process.env.REDIS_URL || "redis://127.0.0.1:6379" });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
      io!.adapter(createAdapter(pubClient, subClient));
      console.log("Socket.IO Redis adapter connected");
    })
    .catch((err) => {
      console.warn("Socket.IO Redis adapter error:", err);
    });

  // Authentication middleware (socket-level)
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers["authorization"]?.toString().replace("Bearer ", "");
      if (!token) return next(new Error("Authentication error: token required"));

      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as any; // { id, email, role, ... }
      socket.data.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      return next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    // join personal room
    if (user?.id) socket.join(`user:${user.id}`);

    // join admin room if admin
    if (user?.role === "admin") socket.join("admins");

    console.log(`Socket connected: ${socket.id} user=${user?.id} role=${user?.role}`);

    socket.on("joinOrderRoom", (orderId: string) => {
      // optional: allow client to join an order-specific room
      socket.join(`order:${orderId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} reason=${reason}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized. Call initSocket(httpServer) first.");
  return io;
}
