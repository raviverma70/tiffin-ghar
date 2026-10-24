import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import {
  listProviderSubscriptionsQuery,
  updateSubscriptionStatusSchema,
} from "../validators/subscription.js";

const router = Router();

router.use(requireAuth, requireRole("PROVIDER"));

const subscriptionInclude = {
  user: { select: { phone: true } },
};

// Naya status kis purane status se aa sakta hai
const ALLOWED_FROM = {
  ACTIVE: ["REQUESTED"],
  REJECTED: ["REQUESTED"],
  COMPLETED: ["ACTIVE"],
  CANCELLED: ["ACTIVE"],
} as const;

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

async function getProviderId(userId: number) {
  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } });
  return provider?.id ?? null;
}

// Meri dukaan ke subscriptions (naya pehle), ?status=REQUESTED se chhaant sakte hain
router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const parsed = listProviderSubscriptionsQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { page, limit, status } = parsed.data;

    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const where = { providerId, ...(status ? { status } : {}) };
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

router.patch("/:id/status", validate(updateSubscriptionStatusSchema), async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(404).json({ error: "Subscription nahi mila" });
    const { status } = req.body as z.infer<typeof updateSubscriptionStatusSchema>;

    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    // Ek hi query me check aur badlav, taaki customer ke cancel ke saath takrao na ho
    const result = await prisma.subscription.updateMany({
      where: { id, providerId, status: { in: [...ALLOWED_FROM[status]] } },
      data: { status },
    });
    if (result.count === 0) {
      const existing = await prisma.subscription.findFirst({ where: { id, providerId }, select: { status: true } });
      if (!existing) return res.status(404).json({ error: "Subscription nahi mila" });
      return res.status(409).json({
        error: `Subscription abhi ${existing.status} hai, isse ${status} nahi kar sakte`,
      });
    }

    const subscription = await prisma.subscription.findFirst({ where: { id, providerId }, include: subscriptionInclude });
    res.json(subscription);
  } catch (e) {
    next(e);
  }
});

export default router;
