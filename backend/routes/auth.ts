import { Router } from "express";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { validate } from "../middleware/validate.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimit.js";
import { sendOtpSchema, verifyOtpSchema } from "../validators/auth.js";

const router = Router();

function hashOtp(phone: string, code: string) {
  return createHmac("sha256", env.JWT_SECRET).update(`${phone}:${code}`).digest("hex");
}

router.post("/send-otp", sendOtpLimiter, validate(sendOtpSchema), async (req, res, next) => {
  try {
    const { phone } = req.body;

    const last = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
    if (last && Date.now() - last.createdAt.getTime() < 60_000) {
      return res.status(429).json({ error: "Thoda ruko, 1 minute baad dobara try karo" });
    }

    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.deleteMany({ where: { phone } });
    await prisma.otp.create({
      data: { phone, codeHash: hashOtp(phone, code), expiresAt },
    });

    // Asli SMS baad me. Production me OTP kabhi print nahi hoga.
    if (env.NODE_ENV !== "production") {
      console.log(`OTP for ${phone}: ${code}`);
    }

    res.json({ message: "OTP bhej diya gaya" });
  } catch (e) {
    next(e);
  }
});

router.post("/verify-otp", verifyOtpLimiter, validate(verifyOtpSchema), async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    const otp = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) return res.status(400).json({ error: "Pehle OTP maango" });
    if (otp.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP expire ho gaya, naya maango" });
    }
    if (otp.attempts >= 5) {
      return res.status(429).json({ error: "Bahut galat koshish, naya OTP maango" });
    }

    const given = Buffer.from(hashOtp(phone, code));
    const saved = Buffer.from(otp.codeHash);
    const ok = given.length === saved.length && timingSafeEqual(given, saved);

    if (!ok) {
      await prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ error: "OTP galat hai" });
    }

    await prisma.otp.deleteMany({ where: { phone } });

    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token, user });
  } catch (e) {
    next(e);
  }
});

export default router;