import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { publicLimiter, reviewLimiter, uploadLimiter } from "../middleware/rateLimit.js";
import { BAD_IMAGE, readImage, removeFile, saveImage } from "../lib/images.js";
import { createReviewSchema, listReviewsQuery } from "../validators/review.js";

const router = Router();

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

// 9999999999 -> 99xxxxxx99
function maskPhone(phone: string) {
  return `${phone.slice(0, 2)}xxxxxx${phone.slice(-2)}`;
}

// Customer apne DELIVERED order par review de (ek order par ek hi)
router.post(
  "/orders/:id/review",
  requireAuth,
  reviewLimiter,
  validate(createReviewSchema),
  async (req: AuthedRequest, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(404).json({ error: "Order nahi mila" });

      const { rating, comment } = req.body as z.infer<typeof createReviewSchema>;
      const userId = req.auth!.userId;

      // Kisi aur ka order ho to wahi "nahi mila" (pata na chale ki wo maujood hai)
      const order = await prisma.order.findFirst({
        where: { id, userId },
        select: { id: true, providerId: true, status: true },
      });
      if (!order) return res.status(404).json({ error: "Order nahi mila" });
      if (order.status !== "DELIVERED") {
        return res.status(409).json({ error: "Review sirf pahunche hue order par de sakte ho" });
      }

      try {
        // Review aur dukaan ki rating ka jod ek saath: dono hon ya dono nahi
        const [review] = await prisma.$transaction([
          prisma.review.create({
            data: { orderId: id, userId, providerId: order.providerId, rating, comment: comment || null },
            select: { id: true, rating: true, comment: true, createdAt: true },
          }),
          prisma.provider.update({
            where: { id: order.providerId },
            data: { ratingSum: { increment: rating }, ratingCount: { increment: 1 } },
          }),
        ]);
        return res.status(201).json(review);
      } catch (e) {
        // orderId unique hai: dobara review dene par
        if ((e as { code?: string }).code === "P2002") {
          return res.status(409).json({ error: "Is order ka review pehle hi ho chuka hai" });
        }
        throw e;
      }
    } catch (e) {
      next(e);
    }
  },
);

// Dukaan ke reviews (sab ke liye, dukaan band ho tab bhi)
router.get("/providers/:id/reviews", publicLimiter, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat provider id" });

    const parsed = listReviewsQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { page, limit } = parsed.data;

    const provider = await prisma.provider.findFirst({
      where: { id, status: "APPROVED" },
      select: { id: true, shopName: true, ratingSum: true, ratingCount: true },
    });
    if (!provider) return res.status(404).json({ error: "Dukaan nahi mili" });

    const reviews = await prisma.review.findMany({
      where: { providerId: id },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        photos: { select: { id: true, url: true }, orderBy: { id: "asc" } },
        user: { select: { phone: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      provider: {
        id: provider.id,
        shopName: provider.shopName,
        rating:
          provider.ratingCount > 0
            ? Math.round((provider.ratingSum / provider.ratingCount) * 10) / 10
            : null,
        ratingCount: provider.ratingCount,
      },
      items: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        photos: r.photos,
        customer: maskPhone(r.user.phone),
      })),
      total: provider.ratingCount,
      page,
      limit,
    });
  } catch (e) {
    next(e);
  }
});

// ---------- Review ke saath photo (customer apne review par, 3 tak) ----------

const MAX_REVIEW_PHOTOS = 3;

router.post(
  "/reviews/:id/photos",
  requireAuth,
  uploadLimiter,
  readImage,
  async (req: AuthedRequest, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(404).json({ error: "Review nahi mila" });

      // Sirf apna review
      const review = await prisma.review.findFirst({
        where: { id, userId: req.auth!.userId },
        select: { id: true, _count: { select: { photos: true } } },
      });
      if (!review) return res.status(404).json({ error: "Review nahi mila" });
      if (review._count.photos >= MAX_REVIEW_PHOTOS) {
        return res.status(400).json({ error: "Ek review me 3 se zyada photo nahi" });
      }

      const url = await saveImage(req.body as Buffer);
      if (!url) return res.status(400).json({ error: BAD_IMAGE });

      const photo = await prisma.reviewPhoto.create({
        data: { reviewId: review.id, url },
        select: { id: true, url: true },
      });
      res.status(201).json(photo);
    } catch (e) {
      next(e);
    }
  },
);

router.delete("/reviews/:id/photos/:photoId", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    const photoId = parseId(req.params.photoId);
    if (!id || !photoId) return res.status(404).json({ error: "Photo nahi mili" });

    const photo = await prisma.reviewPhoto.findFirst({
      where: { id: photoId, reviewId: id, review: { userId: req.auth!.userId } },
      select: { id: true, url: true },
    });
    if (!photo) return res.status(404).json({ error: "Photo nahi mili" });

    await prisma.reviewPhoto.delete({ where: { id: photo.id } });
    await removeFile(photo.url);
    res.json({ message: "Photo hata di" });
  } catch (e) {
    next(e);
  }
});

export default router;