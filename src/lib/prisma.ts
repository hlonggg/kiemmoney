import { PrismaClient } from "@prisma/client";

// Singleton pattern — bắt buộc trong Next.js dev mode để tránh mở quá nhiều
// connection tới database mỗi lần hot-reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
