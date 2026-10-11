import "dotenv/config";
import { Router } from "express";
import { createHmac, randomInt,timingSafeEqual } from "crypto";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

// OTP ka hash banata hai (asli OTP database me kabhi save nahi hota)
export function hashOtp(phone: string, code: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET .env me nahi mila");
  return createHmac("sha256", secret).update(`${phone}:${code}`).digest("hex");
}

router.post("/send-otp", async (req, res) => {
  try {
    const phone = String(req.body?.phone ?? "").trim();

    // 10 digit ka Indian mobile number (6, 7, 8 ya 9 se shuru)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Sahi 10 digit ka mobile number daalo" });
    }

    // 60 second ke andar dobara OTP nahi (spam rokne ke liye)
    const last = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
    if (last && Date.now() - last.createdAt.getTime() < 60_000) {
      return res.status(429).json({ error: "Thoda ruko, 1 minute baad dobara try karo" });
    }

    const code = String(randomInt(100000, 1000000)); // 6 digit
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minute

    await prisma.otp.deleteMany({ where: { phone } }); // purane OTP hatao
    await prisma.otp.create({
      data: { phone, codeHash: hashOtp(phone, code), expiresAt },
    });

    // Abhi sirf terminal me. Asli SMS service baad me.
    console.log(`OTP for ${phone}: ${code}`);

    res.json({ message: "OTP bhej diya gaya" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Kuch gadbad hui, baad me try karo" });
  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const phone = String(req.body?.phone ?? "").trim();
    const code = String(req.body?.code ?? "").trim();

    if (!/^[6-9]\d{9}$/.test(phone) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Phone aur 6 digit ka OTP daalo" });
    }

    const otp = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return res.status(400).json({ error: "Pehle OTP maango" });
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP expire ho gaya, naya maango" });
    }
    if (otp.attempts >= 5) {
      return res.status(429).json({ error: "Bahut galat koshish, naya OTP maango" });
    }

    // Hash match karo
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

    // Sahi OTP: use hata do (ek OTP sirf ek baar chalta hai)
    await prisma.otp.deleteMany({ where: { phone } });

    // User hai to wahi, nahi to naya bana do
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET .env me nahi mila");

    const token = jwt.sign({ userId: user.id, role: user.role }, secret, {
      expiresIn: "30d",
    });

    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Kuch gadbad hui, baad me try karo" });
  }
});

export default router;