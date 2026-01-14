import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { logger } from "./config/logger";

const PORT = env.PORT;

const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received. Closing server...");
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Server and database closed");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Closing server...");
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Server and database closed");
    process.exit(0);
  });
});
