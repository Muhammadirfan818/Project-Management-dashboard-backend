import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Authentication middleware
 * Checks for Bearer token in Authorization header, validates it using SUPABASE_JWT_SECRET,
 * and populates req.user with decoded user details.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (!secret) {
        console.error("Missing SUPABASE_JWT_SECRET environment variable");
        return res.status(500).json({ error: "Server configuration error" });
      }

      // Verify token
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      // Log for debugging if needed (remove in prod)
      // console.log("Decoded JWT:", decoded);

      // Populate req.user
      req.user = {
        sub: decoded.sub as string, // The User UUID
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

  // Development convenience: allow `x-supabase-id` header to simulate auth
  // This expects the explicit UUID in the header, not a token.
  if (process.env.NODE_ENV === "development") {
    const devSupabaseId = req.headers["x-supabase-id"] as string | undefined;
    if (devSupabaseId) {
      req.user = { sub: devSupabaseId };
      return next();
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
};
