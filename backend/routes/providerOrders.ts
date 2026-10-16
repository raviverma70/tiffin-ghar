import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { listProviderOrdersQuery, updateOrderStatusSchema } from "../validators/providerOrder.js";

const router = Router();

router.use(requireAuth, requireRole("PROVIDER"));

const orderInclude = {
  items: { select: { id: true, name: true, pricePaise: true, quantity: true } },
  user: { select: { phone: true } },
};

// Naya status kis purane status se aa sakta hai
const ALLOWED_FROM = {
  ACCEPTED: ["PLACED"],
  REJECTED: ["PLACED", "ACCEPTED"],
  PREPARING: ["ACCEPTED"],
  OUT_FOR_DELIVERY: ["PREPARING"],
  DELIVERED: ["OUT_FOR_DELIVERY"],
} as const;

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

async function getProviderId(userId: number) {
  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } });
  return provider?.id ?? null;
}

// Meri dukaan ke orders (naya pehle), ?status=PLACED se chhaant sakte hain
router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const parsed = listProviderOrdersQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { status, page, limit } = parsed.data;

    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const where = { providerId, ...(status ? { status } : {}) };

    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  } catch (e) {
    next(e);
  }
});

// Ek order
router.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat order id" });

    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    const order = await prisma.order.findFirst({ where: { id, providerId }, include: orderInclude });
    if (!order) return res.status(404).json({ error: "Order nahi mila" });

    res.json(order);
  } catch (e) {
    next(e);
  }
});

// Status badlo
router.patch("/:id/status", validate(updateOrderStatusSchema), async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat order id" });
    const { status } = req.body as z.infer<typeof updateOrderStatusSchema>;

    const providerId = await getProviderId(req.auth!.userId);
    if (!providerId) return res.status(404).json({ error: "Provider profile nahi mili" });

    // Ek hi query me check aur badlav, taaki customer ke cancel ke saath takrao na ho
    const result = await prisma.order.updateMany({
      where: { id, providerId, status: { in: [...ALLOWED_FROM[status]] } },
      data: { status },
    });

    if (result.count === 0) {
      const existing = await prisma.order.findFirst({ where: { id, providerId }, select: { status: true } });
      if (!existing) return res.status(404).json({ error: "Order nahi mila" });
      return res.status(409).json({
        error: `Order abhi ${existing.status} hai, isse ${status} nahi kar sakte`,
      });
    }

    const order = await prisma.order.findFirst({ where: { id, providerId }, include: orderInclude });
    res.json(order);
  } catch (e) {
    next(e);
  }
});

export default router;