import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { publicLimiter } from "../middleware/rateLimit.js";
import { listProvidersQuery } from "../validators/publicProvider.js";
import { todayInIndia } from "../lib/time.js";
import { averageRating, distanceKm, ratingScore, roundCoord } from "../lib/geo.js";

const router = Router();

const publicProviderSelect = {
  id: true,
  shopName: true,
  city: true,
  area: true,
  pincode: true,
  photoUrl: true,
  ratingSum: true,
  ratingCount: true,
};

// ratingSum bahar nahi bhejte, average (ek decimal tak) bhejte hain
function withRating<T extends { ratingSum: number; ratingCount: number }>(p: T) {
  const { ratingSum, ratingCount, ...rest } = p;
  return { ...rest, ratingCount, rating: averageRating(ratingSum, ratingCount) };
}

// Ek shehar me itni dukaanon tak sort memory me hota hai. Isse zyada ho to database me sort (PostGIS) karna hoga
const MAX_IN_CITY = 500;

const approvedOpen = { status: "APPROVED" as const, isOpen: true };

// 0.45 degree ≈ 50 km (shehar na diya ho to itne dabbe me dhundte hain)
const NEAR_DEG = 0.45;

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

// Approved aur khule providers ki list.
// Sort: location ho to paas wali pehle (sort=rating se top rating), warna top rating.
// area diya ho to us area ki dukaanein sabse pehle, phir baaki shehar.
router.get("/", publicLimiter, async (req, res, next) => {
  try {
    const parsed = listProvidersQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { city, pincode, area, page, limit, veg } = parsed.data;
    const lat = parsed.data.lat === undefined ? undefined : roundCoord(parsed.data.lat);
    const lng = parsed.data.lng === undefined ? undefined : roundCoord(parsed.data.lng);
    const sort = parsed.data.sort ?? (lat !== undefined ? "distance" : "rating");
    const today = todayInIndia();

    // Shehar na ho to location ke aas-paas (lagbhag 50 km ka dabba) ki dukaanein
    const near =
      city === undefined && lat !== undefined && lng !== undefined
        ? {
            latitude: { gte: lat - NEAR_DEG, lte: lat + NEAR_DEG },
            longitude: { gte: lng - NEAR_DEG, lte: lng + NEAR_DEG },
          }
        : {};

    const rows = await prisma.provider.findMany({
      where: {
        ...approvedOpen,
        ...(city !== undefined ? { city: { equals: city, mode: "insensitive" as const } } : near),
        ...(pincode ? { pincode } : {}),
      },
      select: {
        ...publicProviderSelect,
        latitude: true,
        longitude: true,
        fssaiNumber: true,
        // Aaj ke menu ki jhalak: sabse saste 3 item
        menuItems: {
          where: { isAvailable: true, OR: [{ dayOfWeek: today }, { dayOfWeek: null }] },
          select: { name: true, pricePaise: true, isVeg: true, mealTime: true },
          orderBy: [{ pricePaise: "asc" }, { id: "asc" }],
          take: 3,
        },
        // Sabse naya achha review (card par ek line)
        reviews: {
          where: { rating: { gte: 4 }, comment: { not: null } },
          select: { rating: true, comment: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            plans: { where: { isActive: true } },
            menuItems: { where: { isAvailable: true, isVeg: false } },
          },
        },
      },
      orderBy: { id: "asc" },
      take: MAX_IN_CITY,
    });

    const areaKey = area?.toLowerCase();

    const items = rows
      .map((p) => {
        const { latitude, longitude, fssaiNumber, menuItems, reviews, _count, ...rest } = p;
        const distance =
          lat !== undefined && lng !== undefined && latitude !== null && longitude !== null
            ? Math.round(distanceKm(lat, lng, latitude, longitude) * 10) / 10
            : null;
        return {
          ...withRating(rest),
          distanceKm: distance,
          inArea: areaKey !== undefined && p.area?.toLowerCase() === areaKey,
          isVerified: fssaiNumber !== null,
          isPureVeg: _count.menuItems === 0,
          planCount: _count.plans,
          startingPricePaise: menuItems[0]?.pricePaise ?? null,
          todayPreview: menuItems,
          topReview: reviews[0] ?? null,
          score: ratingScore(p.ratingSum, p.ratingCount),
        };
      })
      .filter((p) => !veg || p.isPureVeg)
      .sort((a, b) => {
        if (a.inArea !== b.inArea) return a.inArea ? -1 : 1;
        if (sort === "distance") {
          // Bina location wali dukaanein aakhir me
          if (a.distanceKm === null || b.distanceKm === null) {
            if (a.distanceKm !== b.distanceKm) return a.distanceKm === null ? 1 : -1;
          } else if (a.distanceKm !== b.distanceKm) {
            return a.distanceKm - b.distanceKm;
          }
        }
        return b.score - a.score || b.ratingCount - a.ratingCount || a.id - b.id;
      });

    const pageItems = items.slice((page - 1) * limit, page * limit).map(({ score: _score, ...p }) => p);

    res.json({ items: pageItems, total: items.length, page, limit, sort });
  } catch (e) {
    next(e);
  }
});

// Jin shehron me approved dukaanein hain (front page ke shehar ke button)
router.get("/cities", publicLimiter, async (_req, res, next) => {
  try {
    const rows = await prisma.provider.groupBy({
      by: ["city"],
      where: { status: "APPROVED" },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 30,
    });
    res.json({ items: rows.map((r) => ({ city: r.city, shops: r._count._all })) });
  } catch (e) {
    next(e);
  }
});

// Ek shehar ke area (mohalle) jahan approved dukaanein hain
router.get("/areas", publicLimiter, async (req, res, next) => {
  try {
    const city = String(req.query.city ?? "").trim();
    if (city.length < 2 || city.length > 60) return res.status(400).json({ error: "Shehar likho" });

    const rows = await prisma.provider.groupBy({
      by: ["area"],
      where: { status: "APPROVED", city: { equals: city, mode: "insensitive" }, area: { not: null } },
      _count: { _all: true },
      orderBy: { area: "asc" },
      take: 100,
    });
    res.json({ items: rows.map((r) => ({ area: r.area, shops: r._count._all })) });
  } catch (e) {
    next(e);
  }
});

// Ek provider ka aaj ka menu
router.get("/:id/menu", publicLimiter, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat provider id" });

    const provider = await prisma.provider.findFirst({
      where: { id, ...approvedOpen },
      select: publicProviderSelect,
    });
    if (!provider) {
      return res.status(404).json({ error: "Ye dukaan abhi band hai ya mili nahi" });
    }

    const today = todayInIndia();

    const items = await prisma.menuItem.findMany({
      where: {
        providerId: id,
        isAvailable: true,
        OR: [{ dayOfWeek: today }, { dayOfWeek: null }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        pricePaise: true,
        isVeg: true,
        dayOfWeek: true,
        mealTime: true,
        photoUrl: true,
      },
      orderBy: { id: "asc" },
    });

    res.json({ provider: withRating(provider), day: today, items });
  } catch (e) {
    next(e);
  }
});

// Dukaan ke chalu subscription plans, har din ke menu ke saath (dukaan band ho tab bhi dikhte hain)
router.get("/:id/plans", publicLimiter, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat provider id" });

    const provider = await prisma.provider.findFirst({
      where: { id, status: "APPROVED" },
      select: { id: true },
    });
    if (!provider) return res.status(404).json({ error: "Dukaan nahi mili" });

    const plans = await prisma.subscriptionPlan.findMany({
      where: { providerId: id, isActive: true },
      include: { dayMenus: { orderBy: [{ day: "asc" }, { mealTime: "asc" }] } },
      orderBy: [{ days: "asc" }, { pricePaise: "asc" }],
    });
    res.json({ items: plans });
  } catch (e) {
    next(e);
  }
});

export default router;
