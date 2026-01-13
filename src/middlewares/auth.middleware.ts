import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (!secret) {
        console.error("Missing SUPABASE_JWT_SECRET environment variable");
        return res.status(500).json({ error: "Server configuration error" });
      }

      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      req.user = {
        sub: decoded.sub as string,
        email: decoded.email,
        name: decoded.user_metadata?.full_name || decoded.user_metadata?.name,
        avatar:
          decoded.user_metadata?.avatar_url || decoded.user_metadata?.picture,
      };

      return next();
    } catch (error) {
      console.error("JWT Verification failed:", error);
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  if (process.env.NODE_ENV === "development") {
    const devSupabaseId = req.headers["x-supabase-id"] as string | undefined;
    if (devSupabaseId) {
      req.user = { sub: devSupabaseId };
      return next();
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
};
