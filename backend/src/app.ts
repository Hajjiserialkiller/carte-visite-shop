import { mkdirSync } from "node:fs";
import express from "express";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import adminRouter from "./routes/admin.js";
import { security, globalRateLimit } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { uploadsDir } from "./controllers/uploadController.js";

export function createApp() {
  const app = express();

  mkdirSync(uploadsDir, { recursive: true });
  app.disable("x-powered-by");
  app.use(security);
  app.use(globalRateLimit);
  app.use(express.json({ limit: "100kb" }));

  app.use("/uploads", express.static(uploadsDir, { maxAge: "7d", immutable: true, index: false }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
