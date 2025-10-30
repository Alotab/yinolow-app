export function setupGracefulShutdown(stopFns: (() => Promise<void>)[]) {
  async function shutdown(signal: string) {
    console.log(`\n⚠️  Received ${signal}. Graceful shutdown...`);
    for (const fn of stopFns) {
      try {
        await fn();
      } catch (err) {
        console.error("Error during shutdown:", err);
      }
    }
    process.exit(0);
  }
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
