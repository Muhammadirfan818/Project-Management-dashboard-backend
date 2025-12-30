import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { logger } from "../config/logger";

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Handle all Prisma errors with user-friendly messages
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = "Database operation failed";

    // Handle specific error codes
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

  // Handle Prisma validation errors (unknown fields, wrong types, etc.)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Invalid data provided",
    });
  }

  // Handle other Prisma errors
  if (err.name?.includes("Prisma")) {
    return res.status(400).json({
      status: "error",
      message: "Database operation failed",
    });
  }

  // Return actual error message for known Error instances
  // Only hide message for truly unexpected errors
  return res.status(400).json({
    status: "error",
    message: err.message || "An unexpected error occurred",
  });
}
