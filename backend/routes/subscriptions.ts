import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { orderLimiter } from "../middleware/rateLimit.js";
import { createSubscriptionSchema, listSubscriptionsQuery } from "../validators/subscription.js";
import { addDays, todayDateInIndia } from "../lib/time.js";

const router = Router();

// Customer ke subscriptions, login zaroori
router.use(requireAuth);

const subscriptionInclude = {
  provider: { select: { id: true, shopName: true, area: true, city: true } },
};

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

// Tareekh sach me maujood hai? ("2026-02-30" nahi)
function isRealDate(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

// Mere subscriptions (naya pehle)
router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const parsed = listSubscriptionsQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { page, limit } = parsed.data;
    const where = { userId: req.auth!.userId };

    const [items, total] = await prisma.$transaction([
      prisma.subscription.findMany({
        where,
        include: subscriptionInclude,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);
    res.json({ items, total, page, limit });
  } catch (e) {
    next(e);
  }
});

// Mera ek subscription, plan ke din-wise menu ke saath
router.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Subscription nahi mila" });

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId: req.auth!.userId },
      include: {
        ...subscriptionInclude,
        plan: { select: { dayMenus: { orderBy: [{ day: "asc" }, { mealTime: "asc" }] } } },
      },
    });
    if (!subscription) return res.status(404).json({ error: "Subscription nahi mila" });

    const { plan, ...rest } = subscription;
    res.json({ ...rest, dayMenus: plan.dayMenus });
  } catch (e) {
    next(e);
  }
});

// Plan lo (payment abhi seedha dukaan wale ko, COD jaisa)
router.post("/", orderLimiter, validate(createSubscriptionSchema), async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { planId, startDate, deliveryAddress, note } = req.body as z.infer<typeof createSubscriptionSchema>;

    const today = todayDateInIndia();
    if (!isRealDate(startDate) || startDate < today || startDate > addDays(today, 30)) {
      return res.status(400).json({ error: "Shuru ki tareekh aaj se 30 din ke andar chuno" });
    }

    const plan = await prisma.subscriptionPlan.findFirst({
      where: { id: planId, isActive: true, provider: { status: "APPROVED" } },
      include: { provider: { select: { id: true, userId: true } } },
    });
    if (!plan) return res.status(404).json({ error: "Plan nahi mila" });
    if (plan.provider.userId === userId) {
      return res.status(400).json({ error: "Aap apni hi dukaan ka plan nahi le sakte" });
    }

    // Daam, din aur time plan se (database), customer ke bheje par bharosa nahi
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        providerId: plan.provider.id,
        planId: plan.id,
        planName: plan.name,
        days: plan.days,
        mealTimes: plan.mealTimes,
        pricePaise: plan.pricePaise,
        startDate: new Date(`${startDate}T00:00:00Z`),
        deliveryAddress,
        note: note ? note : null,
      },
      include: subscriptionInclude,
    });
    res.status(201).json(subscription);
  } catch (e) {
    next(e);
  }
});

// Cancel (sirf jab tak dukaan wale ne chalu nahi kiya)
router.patch("/:id/cancel", async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Subscription nahi mila" });
    const userId = req.auth!.userId;

    const result = await prisma.subscription.updateMany({
      where: { id, userId, status: "REQUESTED" },
      data: { status: "CANCELLED" },
    });
    if (result.count === 0) {
      const existing = await prisma.subscription.findFirst({ where: { id, userId }, select: { status: true } });
      if (!existing) return res.status(404).json({ error: "Subscription nahi mila" });
      return res.status(409).json({ error: "Ab ye subscription cancel nahi ho sakta, dukaan wale se baat karo" });
    }

    const subscription = await prisma.subscription.findFirst({ where: { id, userId }, include: subscriptionInclude });
    res.json(subscription);
  } catch (e) {
    next(e);
  }
});

export default router;
