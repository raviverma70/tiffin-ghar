import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { createMenuItemSchema, updateMenuItemSchema } from "../validators/menu.js";

const router = Router();

// Is router ke saare routes sirf PROVIDER ke liye
router.use(requireAuth, requireRole("PROVIDER"));

function parseId(value: string) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function myProvider(userId: number) {
  return prisma.provider.findUnique({ where: { userId } });
}

// Meri poori menu
router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const provider = await myProvider(req.auth!.userId);
    if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });

    const items = await prisma.menuItem.findMany({
      where: { providerId: provider.id },
      orderBy: [{ dayOfWeek: "asc" }, { id: "asc" }],
    });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// Naya item
router.post("/", validate(createMenuItemSchema), async (req: AuthedRequest, res, next) => {
  try {
    const provider = await myProvider(req.auth!.userId);
    if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });

    const item = await prisma.menuItem.create({
      data: { providerId: provider.id, ...req.body },
    });
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

// Item badlo
router.patch("/:id", validate(updateMenuItemSchema), async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(String(req.params.id));
    if (!id) return res.status(400).json({ error: "Galat item id" });

    const provider = await myProvider(req.auth!.userId);
    if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });

    // providerId bhi match karwate hain, taaki dusre ka item na badle
    const result = await prisma.menuItem.updateMany({
      where: { id, providerId: provider.id },
      data: req.body,
    });
    if (result.count === 0) return res.status(404).json({ error: "Item nahi mila" });

    const item = await prisma.menuItem.findUnique({ where: { id } });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

// Item hatao
router.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(String(req.params.id));
    if (!id) return res.status(400).json({ error: "Galat item id" });

    const provider = await myProvider(req.auth!.userId);
    if (!provider) return res.status(404).json({ error: "Provider profile nahi mili" });

    const result = await prisma.menuItem.deleteMany({
      where: { id, providerId: provider.id },
    });
    if (result.count === 0) return res.status(404).json({ error: "Item nahi mila" });

    res.json({ message: "Item hata diya" });
  } catch (e) {
    next(e);
  }
});

export default router;