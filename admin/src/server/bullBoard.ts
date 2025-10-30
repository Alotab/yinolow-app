import express from "express";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { emailQueue } from "../queues/emailQueue";
import { orderQueue } from "../queues/orderQueue";

const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(orderQueue),
  ],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

// Optional: health check route
app.get("/", (req, res) => res.send("Bull Board is running 🚀"));

const PORT = process.env.BULL_BOARD_PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Bull Board running at http://localhost:${PORT}/admin/queues`);
});
