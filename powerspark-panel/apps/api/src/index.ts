import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { prisma } from "./lib/prisma";
import routes from "./routes";
import { errorHandler } from "./middleware/error-handler";

/**
 * PowerSpark Panel - API
 * Authentication module wired up (register/login/logout/refresh,
 * forgot/reset password, email verification, RBAC middleware).
 * Server-management, file, and billing routes will be added in
 * later steps.
 */
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Liveness check - confirms the API process itself is up.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "powerspark-api" });
});

// Readiness check - confirms the configured PostgreSQL connection works.
app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "unreachable",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use("/api", routes);

app.use(errorHandler);

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PowerSpark Panel API listening on port ${PORT}`);
});
