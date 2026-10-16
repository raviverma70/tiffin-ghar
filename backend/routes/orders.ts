import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { orderLimiter } from "../middleware/rateLimit.js";
import { createOrderSchema } from "../validators/order.js";
import { todayInIndia } from "../lib/time.js";

const router = Router();

// Is router ke saare routes ke liye login zaroori
router.use(requireAuth);

// Naya order (customer)
router.post("/", orderLimiter, validate(createOrderSchema), async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.auth!.userId;
    const { providerId, items, deliveryAddress, note } = req.body as z.infer<typeof createOrderSchema>;

    const provider = await prisma.provider.findFirst({
      where: { id: providerId, status: "APPROVED", isOpen: true },
      select: { id: true, userId: true },
    });
    if (!provider) {
      return res.status(404).json({ error: "Ye dukaan abhi band hai ya mili nahi" });
    }
    if (provider.userId === userId) {
      return res.status(400).json({ error: "Aap apni hi dukaan se order nahi kar sakte" });
    }

    // Ek hi item do baar aaye to quantity jod do
    const qtyById = new Map<number, number>();
    for (const it of items) {
      qtyById.set(it.menuItemId, (qtyById.get(it.menuItemId) ?? 0) + it.quantity);
    }
    for (const qty of qtyById.values()) {
      if (qty > 20) {
        return res.status(400).json({ error: "Ek item ki quantity 20 se zyada nahi ho sakti" });
      }
    }

    // Items usi dukaan ke ho, aaj ke menu me ho aur available ho
    const ids = [...qtyById.keys()];
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: ids },
        providerId,
        isAvailable: true,
        OR: [{ dayOfWeek: todayInIndia() }, { dayOfWeek: null }],
      },
      select: { id: true, name: true, pricePaise: true },
    });
    if (menuItems.length !== ids.length) {
      return res.status(400).json({ error: "Kuch items aaj ke menu me nahi hain ya band hain" });
    }

    // Daam server database se leta hai, customer ke bheje daam par bharosa nahi
    const lines = menuItems.map((m) => ({
      menuItemId: m.id,
      name: m.name,
      pricePaise: m.pricePaise,
      quantity: qtyById.get(m.id) ?? 1,
    }));
    const totalPaise = lines.reduce((sum, l) => sum + l.pricePaise * l.quantity, 0);
    if (totalPaise > 10_000_000) {
      return res.status(400).json({ error: "Order ka total bahut zyada hai" });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        providerId,
        totalPaise,
        deliveryAddress,
        note: note ? note : null,
        items: { create: lines },
      },
      include: {
        items: { select: { id: true, name: true, pricePaise: true, quantity: true } },
        provider: { select: { id: true, shopName: true } },
      },
    });

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

export default router;