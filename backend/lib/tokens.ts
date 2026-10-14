import { createHash, randomBytes, randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import { env } from "../config/env.js";

const ACCESS_TTL = "15m";
const REFRESH_DAYS = 30;

// Refresh token lamba random string hai, isliye tez SHA-256 kaafi hai
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(user: { id: number; role: string }) {
  return jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: ACCESS_TTL,
  });
}

export async function issueRefreshToken(userId: number, familyId: string = randomUUID()) {
  const token = randomBytes(48).toString("hex"); // 96 character
  await prisma.refreshToken.create({
    data: {
      userId,
      familyId,
      tokenHash: hashToken(token), // database me sirf hash, asli token nahi
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}