import { Router } from "express";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { validate } from "../middleware/validate.js";
import { sendOtpLimiter, verifyOtpLimiter, refreshLimiter } from "../middleware/rateLimit.js";
import { sendOtpSchema, verifyOtpSchema, refreshSchema } from "../validators/auth.js";
import { hashToken, signAccessToken, issueRefreshToken } from "../lib/tokens.js";

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

    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user.id);

    res.json({ accessToken, refreshToken, user });
  } catch (e) {
    next(e);
  }
});

router.post("/refresh", refreshLimiter, validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const saved = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: true },
    });

    if (!saved || saved.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: "Session khatam ho gaya, dobara login karo" });
    }

    // Band hua token dobara aaya: chori ka shak, poori family band
    if (saved.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { familyId: saved.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return res.status(401).json({ error: "Session khatam ho gaya, dobara login karo" });
    }

    // Purana token band karo. count 0 matlab kisi aur request ne abhi use band kar diya
    const closed = await prisma.refreshToken.updateMany({
      where: { id: saved.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (closed.count === 0) {
      return res.status(401).json({ error: "Session khatam ho gaya, dobara login karo" });
    }

    const newRefresh = await issueRefreshToken(saved.userId, saved.familyId);
    res.json({ accessToken: signAccessToken(saved.user), refreshToken: newRefresh });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", refreshLimiter, validate(refreshSchema), async (req, res, next) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(req.body.refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    res.json({ message: "Logout ho gaya" });
  } catch (e) {
    next(e);
  }
});

export default router;