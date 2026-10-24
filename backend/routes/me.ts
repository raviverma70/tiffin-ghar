import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { averageRating } from "../lib/geo.js";

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

// ---------- Pasandida dukaanein ----------

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

router.get("/favourites", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const rows = await prisma.favourite.findMany({
      where: { userId: req.auth!.userId, provider: { status: "APPROVED" } },
      select: {
        createdAt: true,
        provider: {
          select: {
            id: true,
            shopName: true,
            city: true,
            area: true,
            photoUrl: true,
            isOpen: true,
            ratingSum: true,
            ratingCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({
      items: rows.map(({ provider: { ratingSum, ratingCount, ...p } }) => ({
        ...p,
        ratingCount,
        rating: averageRating(ratingSum, ratingCount),
      })),
    });
  } catch (e) {
    next(e);
  }
});

// Dil dabaya: pasand me jodo (dobara dabane par bhi kuch nahi tootta)
router.put("/favourites/:providerId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const providerId = parseId(req.params.providerId);
    if (!providerId) return res.status(404).json({ error: "Dukaan nahi mili" });

    const provider = await prisma.provider.findFirst({ where: { id: providerId, status: "APPROVED" }, select: { id: true } });
    if (!provider) return res.status(404).json({ error: "Dukaan nahi mili" });

    const userId = req.auth!.userId;
    const count = await prisma.favourite.count({ where: { userId } });
    if (count >= 100) return res.status(400).json({ error: "100 se zyada pasandida dukaanein nahi rakh sakte" });

    await prisma.favourite.upsert({
      where: { userId_providerId: { userId, providerId } },
      update: {},
      create: { userId, providerId },
    });
    res.json({ providerId, favourite: true });
  } catch (e) {
    next(e);
  }
});

router.delete("/favourites/:providerId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const providerId = parseId(req.params.providerId);
    if (!providerId) return res.status(404).json({ error: "Dukaan nahi mili" });

    await prisma.favourite.deleteMany({ where: { userId: req.auth!.userId, providerId } });
    res.json({ providerId, favourite: false });
  } catch (e) {
    next(e);
  }
});

export default router;
