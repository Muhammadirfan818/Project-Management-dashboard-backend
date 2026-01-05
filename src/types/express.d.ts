import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email?: string;
        role?: string;
        name?: string;
        avatar?: string;
        [key: string]: unknown;
      };
      files?: Express.Multer.File[];
      file?: Express.Multer.File;
    }
  }
}

export {};
