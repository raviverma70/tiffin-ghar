import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { BAD_IMAGE, readImage, removeFile, saveImage } from "../lib/images.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { uploadLimiter } from "../middleware/rateLimit.js";

const router = Router();

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

// ---------- Dukaan ki photo ----------

router.post(
  "/me/photo",
  requireAuth,
  requireRole("PROVIDER"),
  uploadLimiter,
  readImage,
  async (req: AuthedRequest, res, next) => {
    try {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.auth!.userId },
        select: { id: true, photoUrl: true },
      });
      if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });

      const url = await saveImage(req.body as Buffer);
      if (!url) return res.status(400).json({ error: BAD_IMAGE });

      await prisma.provider.update({ where: { id: provider.id }, data: { photoUrl: url } });
      await removeFile(provider.photoUrl);
      res.json({ photoUrl: url });
    } catch (e) {
      next(e);
    }
  },
);

router.delete("/me/photo", requireAuth, requireRole("PROVIDER"), async (req: AuthedRequest, res, next) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: req.auth!.userId },
      select: { id: true, photoUrl: true },
    });
    if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });

    await prisma.provider.update({ where: { id: provider.id }, data: { photoUrl: null } });
    await removeFile(provider.photoUrl);
    res.json({ photoUrl: null });
  } catch (e) {
    next(e);
  }
});

// ---------- Dish ki photo ----------

router.post(
  "/me/menu/:id/photo",
  requireAuth,
  requireRole("PROVIDER"),
  uploadLimiter,
  readImage,
  async (req: AuthedRequest, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(404).json({ error: "Item nahi mila" });

      // Sirf apni dukaan ka item
      const item = await prisma.menuItem.findFirst({
        where: { id, provider: { userId: req.auth!.userId } },
        select: { id: true, photoUrl: true },
      });
      if (!item) return res.status(404).json({ error: "Item nahi mila" });

      const url = await saveImage(req.body as Buffer);
      if (!url) return res.status(400).json({ error: BAD_IMAGE });

      await prisma.menuItem.update({ where: { id: item.id }, data: { photoUrl: url } });
      await removeFile(item.photoUrl);
      res.json({ photoUrl: url });
    } catch (e) {
      next(e);
    }
  },
);

router.delete(
  "/me/menu/:id/photo",
  requireAuth,
  requireRole("PROVIDER"),
  async (req: AuthedRequest, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(404).json({ error: "Item nahi mila" });

      const item = await prisma.menuItem.findFirst({
        where: { id, provider: { userId: req.auth!.userId } },
        select: { id: true, photoUrl: true },
      });
      if (!item) return res.status(404).json({ error: "Item nahi mila" });

      await prisma.menuItem.update({ where: { id: item.id }, data: { photoUrl: null } });
      await removeFile(item.photoUrl);
      res.json({ photoUrl: null });
    } catch (e) {
      next(e);
    }
  },
);

export default router;