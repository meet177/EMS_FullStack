import { prisma } from "@/lib/prisma";

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: "Database connection is healthy." };
  } catch {
    return {
      ok: false,
      message: "Database is not reachable. Start PostgreSQL and verify DATABASE_URL in .env."
    };
  }
}
