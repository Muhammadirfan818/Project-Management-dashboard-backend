import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "./logger";

const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});

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
