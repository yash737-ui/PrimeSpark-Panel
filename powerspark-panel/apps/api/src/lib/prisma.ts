import { PrismaClient } from "@prisma/client";

// Prevents creating a new PrismaClient (and new connection pool) on every
// hot-reload in development, which otherwise exhausts Postgres connections.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
