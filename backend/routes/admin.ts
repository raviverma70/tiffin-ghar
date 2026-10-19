import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listAdminProvidersQuery, setProviderStatusSchema } from "../validators/admin.js";

const router = Router();

// Is router ke saare routes sirf ADMIN ke liye
router.use(requireAuth, requireRole("ADMIN"));

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

// Chhote stats
router.get("/stats", async (_req, res, next) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [users, pending, approved, rejected, orders, orders24h, delivered] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.provider.count({ where: { status: "PENDING" } }),
        prisma.provider.count({ where: { status: "APPROVED" } }),
        prisma.provider.count({ where: { status: "REJECTED" } }),
        prisma.order.count(),
        prisma.order.count({ where: { createdAt: { gte: since } } }),
        prisma.order.count({ where: { status: "DELIVERED" } }),
      ]);

    res.json({
      users,
      providersPending: pending,
      providersApproved: approved,
      providersRejected: rejected,
      orders,
      orders24h,
      delivered,
    });
  } catch (e) {
    next(e);
  }
});

// Providers ki list (?status=PENDING), naya pehle
router.get("/providers", async (req, res, next) => {
  try {
    const parsed = listAdminProvidersQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { status, page, limit } = parsed.data;
    const where = status ? { status } : {};

    const [items, total] = await prisma.$transaction([
      prisma.provider.findMany({
        where,
        include: {
          user: { select: { phone: true } },
          _count: { select: { menuItems: true, orders: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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

// Approve / reject / wapas pending
router.patch("/providers/:id/status", validate(setProviderStatusSchema), async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat provider id" });
    const { status } = req.body as z.infer<typeof setProviderStatusSchema>;

    // Approved ke alawa kuch bhi ho to dukaan band bhi kar do
    const result = await prisma.provider.updateMany({
      where: { id },
      data: status === "APPROVED" ? { status } : { status, isOpen: false },
    });
    if (result.count === 0) return res.status(404).json({ error: "Provider nahi mila" });

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: { select: { phone: true } } },
    });
    res.json(provider);
  } catch (e) {
    next(e);
  }
});

export default router;