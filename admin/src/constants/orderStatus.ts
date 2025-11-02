// src/constants/orderStatus.ts

export const ORDER_STATUSES = [
  "processing",
  "paid",
  "failed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

// ✅ Derive a TypeScript type from the constant
export type OrderStatus = typeof ORDER_STATUSES[number];
