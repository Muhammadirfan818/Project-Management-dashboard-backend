import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "./logger";

// Create a Prisma client instance. Keep error and warn logs enabled.
const prisma = new PrismaClient({
  log: [
    // Query events are still emitted by Prisma, but we only attach a listener
    // when the PRISMA_LOG_QUERIES env var is explicitly set to "true".
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});

// Control whether Prisma query events are printed.
// By default we do NOT print queries to keep terminal output clean for beginners.
// To enable detailed query logging set `PRISMA_LOG_QUERIES=true` in your .env.
const enablePrismaQueryLog = process.env.PRISMA_LOG_QUERIES === "true";

if (enablePrismaQueryLog) {
  prisma.$on("query", (event: Prisma.QueryEvent) => {
    logger.debug("Prisma Query", {
      query: event.query,
      params: event.params,
      duration: event.duration,
    });
  });
}

export { prisma };
