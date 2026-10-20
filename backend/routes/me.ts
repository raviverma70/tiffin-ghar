import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const languageSchema = z.object({
  language: z.enum(["hinglish", "hi", "en"], "Bhasha galat hai"),
});

// User ki pasand ki bhasha yaad rakho (website aur baad me mobile app dono ke liye)
router.patch("/language", requireAuth, validate(languageSchema), async (req: AuthedRequest, res, next) => {
  try {
    const { language } = req.body as z.infer<typeof languageSchema>;
    await prisma.user.update({
      where: { id: req.auth!.userId },
      data: { language },
    });
    res.json({ language });
  } catch (e) {
    next(e);
  }
});

export default router;
