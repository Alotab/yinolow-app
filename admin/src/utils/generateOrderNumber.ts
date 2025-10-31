// src/utils/generateOrderNumber.ts
export function generateOrderNumber(): string {
  // Example: ORD-20251030-6A7B (date + 4 hex chars)
  const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
  const suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `ORD-${date}-${suffix}`;
}
