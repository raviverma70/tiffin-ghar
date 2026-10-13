import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Sahi 10 digit ka mobile number daalo");

export const sendOtpSchema = z.object({ phone });

export const verifyOtpSchema = z.object({
  phone,
  code: z.string().trim().regex(/^\d{6}$/, "6 digit ka OTP daalo"),
});