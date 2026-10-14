import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import {
  createProviderSchema,
  updateProviderSchema,
  openSchema,
} from "../validators/provider.js";

const router = Router();

// Profile banao (koi bhi logged in user)
router.post("/", requireAuth, validate(createProviderSchema), async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.auth!.userId;

    const exists = await prisma.provider.findUnique({ where: { userId } });
    if (exists) {
      return res.status(409).json({ error: "Aapki provider profile pehle se bani hai" });
    }

    const [provider] = await prisma.$transaction([
      prisma.provider.create({ data: { userId, ...req.body } }),
      // sirf CUSTOMER ko PROVIDER banao, ADMIN ka role mat chhedo
      prisma.user.updateMany({ where: { id: userId, role: "CUSTOMER" }, data: { role: "PROVIDER" } }),
    ]);

    res.status(201).json(provider);
  } catch (e) {
    next(e);
  }
});

// Meri profile
router.get("/me", requireAuth, requireRole("PROVIDER"), async (req: AuthedRequest, res, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.auth!.userId } });
    if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });
    res.json(provider);
  } catch (e) {
    next(e);
  }
});

// Profile badlo
router.patch("/me", requireAuth, requireRole("PROVIDER"), validate(updateProviderSchema), async (req: AuthedRequest, res, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.auth!.userId } });
    if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });

    const updated = await prisma.provider.update({
      where: { id: provider.id },
      data: req.body,
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Dukaan khula / band
router.patch("/me/open", requireAuth, requireRole("PROVIDER"), validate(openSchema), async (req: AuthedRequest, res, next) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.auth!.userId } });
    if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });

    if (provider.status !== "APPROVED") {
      return res.status(403).json({ error: "Profile abhi approve nahi hui hai" });
    }

    const updated = await prisma.provider.update({
      where: { id: provider.id },
      data: { isOpen: req.body.isOpen },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

export default router;