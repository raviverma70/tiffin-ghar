import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { createPlanSchema, planMenuSchema, updatePlanSchema } from "../validators/plan.js";
import { isMenuComplete, MENU_INCOMPLETE } from "../lib/plans.js";

const router = Router();

// Is router ke saare routes sirf PROVIDER ke liye (apne hi plans)
router.use(requireAuth, requireRole("PROVIDER"));

const MAX_PLANS = 20;

const planInclude = {
  dayMenus: { orderBy: [{ day: "asc" as const }, { mealTime: "asc" as const }] },
  _count: { select: { subscriptions: true } },
};

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

async function getProviderId(userId: number) {
  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } });
  return provider?.id ?? null;
}

// Mere saare plans
router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const plans = await prisma.subscriptionPlan.findMany({
      where: { providerId },
      include: planInclude,
      orderBy: { id: "asc" },
    });
    res.json({ items: plans });
  } catch (e) {
    next(e);
  }
});

// Mera ek plan
router.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Plan nahi mila" });
    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const plan = await prisma.subscriptionPlan.findFirst({ where: { id, providerId }, include: planInclude });
    if (!plan) return res.status(404).json({ error: "Plan nahi mila" });
    res.json(plan);
  } catch (e) {
    next(e);
  }
});

// Naya plan (band rehta hai jab tak menu na bhare)
router.post("/", validate(createPlanSchema), async (req: AuthedRequest, res, next) => {
  try {
    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const count = await prisma.subscriptionPlan.count({ where: { providerId } });
    if (count >= MAX_PLANS) {
      return res.status(400).json({ error: "Ek dukaan me 20 se zyada plans nahi ho sakte" });
    }

    const body = req.body as z.infer<typeof createPlanSchema>;
    const plan = await prisma.subscriptionPlan.create({
      data: {
        providerId,
        name: body.name,
        description: body.description || null,
        days: body.days,
        mealTimes: body.mealTimes,
        pricePaise: body.pricePaise,
        isVeg: body.isVeg ?? true,
        isActive: false,
      },
      include: planInclude,
    });
    res.status(201).json(plan);
  } catch (e) {
    next(e);
  }
});

// Plan badlo. Din ya time kam kiye to bahar wale din/time ka menu hat jata hai
router.patch("/:id", validate(updatePlanSchema), async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Plan nahi mila" });
    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const plan = await prisma.subscriptionPlan.findFirst({ where: { id, providerId }, include: { dayMenus: true } });
    if (!plan) return res.status(404).json({ error: "Plan nahi mila" });

    const body = req.body as z.infer<typeof updatePlanSchema>;
    const days = body.days ?? plan.days;
    const mealTimes = body.mealTimes ?? plan.mealTimes;
    const keptMenus = plan.dayMenus.filter((m) => m.day <= days && mealTimes.includes(m.mealTime));
    const isActive = body.isActive ?? plan.isActive;

    if (isActive && !isMenuComplete({ days, mealTimes }, keptMenus)) {
      return res.status(409).json({ error: MENU_INCOMPLETE });
    }

    const [, updated] = await prisma.$transaction([
      prisma.planDayMenu.deleteMany({
        where: { planId: id, OR: [{ day: { gt: days } }, { mealTime: { notIn: mealTimes } }] },
      }),
      prisma.subscriptionPlan.update({
        where: { id },
        data: {
          name: body.name ?? plan.name,
          description: body.description !== undefined ? body.description || null : plan.description,
          days,
          mealTimes,
          pricePaise: body.pricePaise ?? plan.pricePaise,
          isVeg: body.isVeg ?? plan.isVeg,
          isActive,
        },
        include: planInclude,
      }),
    ]);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Poora din-wise menu ek saath save (copy-paste wale din bhi isi se)
router.put("/:id/menu", validate(planMenuSchema), async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Plan nahi mila" });
    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const plan = await prisma.subscriptionPlan.findFirst({ where: { id, providerId } });
    if (!plan) return res.status(404).json({ error: "Plan nahi mila" });

    const { items } = req.body as z.infer<typeof planMenuSchema>;
    const seen = new Set<string>();
    for (const item of items) {
      if (item.day > plan.days) {
        return res.status(400).json({ error: "Din plan ke dino se zyada hai" });
      }
      if (!plan.mealTimes.includes(item.mealTime)) {
        return res.status(400).json({ error: "Ye khane ka time is plan me nahi hai" });
      }
      const key = `${item.day}:${item.mealTime}`;
      if (seen.has(key)) return res.status(400).json({ error: "Ek din ka ek time do baar bheja hai" });
      seen.add(key);
    }

    // Chalu plan ka menu adhoora nahi ho sakta (customer ko har din ka khana dikhna chahiye)
    if (plan.isActive && !isMenuComplete(plan, items)) {
      return res.status(409).json({ error: "Chalu plan ka menu adhoora nahi chhod sakte, pehle plan band karo" });
    }

    const [, , updated] = await prisma.$transaction([
      prisma.planDayMenu.deleteMany({ where: { planId: id } }),
      prisma.planDayMenu.createMany({
        data: items.map((item) => ({ planId: id, day: item.day, mealTime: item.mealTime, dishes: item.dishes })),
      }),
      prisma.subscriptionPlan.findUniqueOrThrow({ where: { id }, include: planInclude }),
    ]);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Plan hatao. Kisi ne liya ho to sirf band hota hai (purane subscriptions ka record rahe)
router.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Plan nahi mila" });
    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id, providerId },
      include: { _count: { select: { subscriptions: true } } },
    });
    if (!plan) return res.status(404).json({ error: "Plan nahi mila" });

    if (plan._count.subscriptions > 0) {
      await prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } });
      return res.json({ message: "Plan band kar diya (isme subscriptions hain, isliye hataya nahi)", deleted: false });
    }

    await prisma.subscriptionPlan.delete({ where: { id } });
    res.json({ message: "Plan hata diya", deleted: true });
  } catch (e) {
    next(e);
  }
});

export default router;
