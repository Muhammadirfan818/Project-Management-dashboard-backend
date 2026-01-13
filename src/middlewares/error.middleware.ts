import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { logger } from "../config/logger";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

export function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = "Database operation failed";

    switch (err.code) {
      case "P2002":
        message = "A record with this value already exists";
        break;
      case "P2025":
        message = "Record not found";
        break;
      case "P2003":
        message = "Related record not found";
        break;
      default:
        message = "Database operation failed";
    }

    return res.status(400).json({
      status: "error",
      message,
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Invalid data provided",
    });
  }

  if (err.name?.includes("Prisma")) {
    return res.status(400).json({
      status: "error",
      message: "Database operation failed",
    });
  }

  return res.status(400).json({
    status: "error",
    message: err.message || "An unexpected error occurred",
  });
}
