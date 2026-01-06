import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import reportRoutes from "./routes/reports";
import scannerRoutes from "./routes/scanners";
import scanRoutes from "./routes/scans";

export function createApp() {
  const app = express();
  app.use(pinoHttp({ autoLogging: { ignore: (req) => req.url === "/health" } }));
  app.use(helmet());
  app.use(cors({ origin: config.allowedOrigins ?? true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/scans", scanRoutes);
  app.use("/api/scanners", scannerRoutes);
  app.use("/api/reports", reportRoutes);

  app.use(errorHandler);

  return app;
}

export const app = createApp();
