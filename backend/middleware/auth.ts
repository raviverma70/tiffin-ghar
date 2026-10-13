import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthedRequest = Request & {
  auth?: { userId: number; role: string };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const [type, token] = (req.headers.authorization ?? "").split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Login zaroori hai" });
  }

  try {
    const data = jwt.verify(token, env.JWT_SECRET) as { userId: number; role: string };
    req.auth = { userId: data.userId, role: data.role };
    next();
  } catch {
    res.status(401).json({ error: "Token galat ya expire hai, dobara login karo" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Aapko ye karne ki ijazat nahi hai" });
    }
    next();
  };
}