import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Returns a PrismaClient that matches the current schema.
 * Next.js hot reload can keep an old client on globalThis after model renames
 * (e.g. workoutLog → trainingLog), which makes prisma.trainingLog undefined.
 */
function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;

  if (
    existing &&
    typeof (existing as { trainingLog?: { count?: unknown } }).trainingLog
      ?.count === "function"
  ) {
    return existing;
  }

  if (existing) {
    void existing.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();

  if (
    typeof (client as { trainingLog?: { count?: unknown } }).trainingLog
      ?.count !== "function"
  ) {
    throw new Error(
      "Prisma client is missing TrainingLog. Run: npx prisma generate && restart the dev server."
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
