import express, { Router, type NextFunction, type Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { UPLOAD_DIR } from "../lib/uploads.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { uploadLimiter } from "../middleware/rateLimit.js";

const router = Router();

const rawImage = express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "2mb" });

// Photo ka raw data padho (2 MB tak, sirf JPG/PNG/WebP content-type)
function readImage(req: AuthedRequest, res: Response, next: NextFunction) {
  rawImage(req, res, (err?: unknown) => {
    if (err) {
      return res.status(413).json({ error: "Photo 2 MB se chhoti rakho (JPG, PNG ya WebP)" });
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: "Sirf JPG, PNG ya WebP photo bhejo" });
    }
    next();
  });
}

// Asli file ke shuru ke bytes dekhte hain, naam ya type par bharosa nahi
function detectExt(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf.length > 12 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

async function saveImage(buf: Buffer): Promise<string | null> {
  const ext = detectExt(buf);
  if (!ext) return null;
  const name = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf, { flag: "wx" });
  return `/uploads/${name}`;
}

async function removeFile(url: string | null) {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch {
    // file pehle se nahi hai to koi baat nahi
  }
}

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

const BAD_IMAGE = "Ye photo sahi nahi hai. JPG, PNG ya WebP bhejo";

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