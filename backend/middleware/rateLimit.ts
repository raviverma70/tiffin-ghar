import { rateLimit } from "express-rate-limit";

const make = (windowMs: number, limit: number, error: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error },
  });

export const globalLimiter = make(60_000, 120, "Bahut zyada requests, thoda ruko");
export const sendOtpLimiter = make(15 * 60_000, 10, "Bahut zyada OTP requests, 15 minute baad try karo");
export const verifyOtpLimiter = make(15 * 60_000, 20, "Bahut zyada koshish, 15 minute baad try karo");