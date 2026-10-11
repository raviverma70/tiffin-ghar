import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthedRequest = Request & {
  auth?: { userId: number; role: string };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Login zaroori hai" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server config galat hai" });
  }

  try {
    const data = jwt.verify(token, secret) as { userId: number; role: string };
    req.auth = { userId: data.userId, role: data.role };
    next();
  } catch {
    res.status(401).json({ error: "Token galat ya expire hai, dobara login karo" });
  }
}

// Sirf kuch roles ko ijazat dene ke liye (baad me provider/admin routes me)
export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Aapko ye karne ki ijazat nahi hai" });
    }
    next();
  };
}