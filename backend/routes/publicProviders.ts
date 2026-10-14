import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { publicLimiter } from "../middleware/rateLimit.js";
import { listProvidersQuery } from "../validators/publicProvider.js";
import { todayInIndia } from "../lib/time.js";

const router = Router();

const publicProviderSelect = {
  id: true,
  shopName: true,
  city: true,
  pincode: true,
};

// Approved aur khule providers ki list
router.get("/", publicLimiter, async (req, res, next) => {
  try {
    const parsed = listProvidersQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { city, pincode, page, limit } = parsed.data;

    const where = {
      status: "APPROVED" as const,
      isOpen: true,
      city: { equals: city, mode: "insensitive" as const },
      ...(pincode ? { pincode } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.provider.findMany({
        where,
        select: publicProviderSelect,
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  } catch (e) {
    next(e);
  }
});

// Ek provider ka aaj ka menu
router.get("/:id/menu", publicLimiter, async (req, res, next) => {
  try {
    const id = Number(String(req.params.id));
    if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) {
      return res.status(400).json({ error: "Galat provider id" });
    }

    const provider = await prisma.provider.findFirst({
      where: { id, status: "APPROVED", isOpen: true },
      select: publicProviderSelect,
    });
    if (!provider) {
      return res.status(404).json({ error: "Ye dukaan abhi band hai ya mili nahi" });
    }

    const today = todayInIndia();

    const items = await prisma.menuItem.findMany({
      where: {
        providerId: id,
        isAvailable: true,
        OR: [{ dayOfWeek: today }, { dayOfWeek: null }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        pricePaise: true,
        isVeg: true,
        dayOfWeek: true,
      },
      orderBy: { id: "asc" },
    });

    res.json({ provider, day: today, items });
  } catch (e) {
    next(e);
  }
});

export default router;