import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";

export interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: data.user.id,
      email: data.user.email!,
    };

    next();
  } catch {
    res.status(401).json({ error: "Authentication failed" });
  }
}
