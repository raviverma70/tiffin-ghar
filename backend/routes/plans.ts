import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { publicLimiter } from "../middleware/rateLimit.js";
import { listPlansQuery } from "../validators/publicProvider.js";
import { averageRating, ratingScore } from "../lib/geo.js";

const router = Router();

const providerSelect = {
  id: true,
  shopName: true,
  city: true,
  area: true,
  photoUrl: true,
  ratingSum: true,
  ratingCount: true,
};

function publicProvider(p: {
  id: number;
  shopName: string;
  city: string;
  area: string | null;
  photoUrl: string | null;
  ratingSum: number;
  ratingCount: number;
}) {
  const { ratingSum, ratingCount, ...rest } = p;
  return { ...rest, ratingCount, rating: averageRating(ratingSum, ratingCount) };
}

// Shehar ke chalu plans (front page ki "Subscription plans" row): area wale pehle, phir dukaan ki rating
router.get("/", publicLimiter, async (req, res, next) => {
  try {
    const parsed = listPlansQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { city, area, limit } = parsed.data;
    const areaKey = area?.toLowerCase();

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
        provider: { status: "APPROVED", city: { equals: city, mode: "insensitive" } },
      },
      select: {
        id: true,
        name: true,
        description: true,
        days: true,
        mealTimes: true,
        pricePaise: true,
        isVeg: true,
        // Din 1 ka menu jhalak ke liye
        dayMenus: { where: { day: 1 }, select: { mealTime: true, dishes: true }, orderBy: { mealTime: "asc" } },
        provider: { select: providerSelect },
      },
      take: 500,
    });

    const items = plans
      .map((plan) => ({
        plan,
        inArea: areaKey !== undefined && plan.provider.area?.toLowerCase() === areaKey,
        score: ratingScore(plan.provider.ratingSum, plan.provider.ratingCount),
      }))
      .sort((a, b) => {
        if (a.inArea !== b.inArea) return a.inArea ? -1 : 1;
        return b.score - a.score || a.plan.pricePaise - b.plan.pricePaise || a.plan.id - b.plan.id;
      })
      .slice(0, limit)
      .map(({ plan, inArea }) => ({ ...plan, provider: publicProvider(plan.provider), inArea }));

    res.json({ items });
  } catch (e) {
    next(e);
  }
});

// Ek plan poore din-wise menu ke saath
router.get("/:id", publicLimiter, async (req, res, next) => {
  try {
    const id = Number(String(req.params.id));
    if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) {
      return res.status(404).json({ error: "Plan nahi mila" });
    }

    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id, isActive: true, provider: { status: "APPROVED" } },
      include: {
        dayMenus: { orderBy: [{ day: "asc" }, { mealTime: "asc" }] },
        provider: { select: providerSelect },
      },
    });
    if (!plan) return res.status(404).json({ error: "Plan nahi mila" });

    res.json({ ...plan, provider: publicProvider(plan.provider) });
  } catch (e) {
    next(e);
  }
});

export default router;
