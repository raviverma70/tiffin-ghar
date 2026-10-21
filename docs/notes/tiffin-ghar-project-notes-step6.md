# Tiffin Ghar: Notes (Step 5.3 login, Step 6.1 se 6.5 orders: poora code aur saari test commands)

Ye file in chaar files ke **saath** use karni hai: `tiffin-ghar-project-notes-step3.md`, `tiffin-ghar-project-notes-step3-5-1.md`, `tiffin-ghar-project-notes-step4.md` aur `tiffin-ghar-project-notes-step5.md`. Is file me wo sab hai jo uske baad hua: website par customer login (5.3), Order tables (6.1), customer order banaye/dekhe/cancel kare (6.2, 6.3), provider orders ka status badle (6.4), customer ke website pages (6.5), saath me **ab tak ki saari test commands (login samet)**. **Naye chat me paanchon files attach karo. Naye chat se Step 6.6 (provider dashboard, website) shuru hoga.**

## 1. Abhi kahan hain

- Step 1 se 5.2: ho gaye, push hue.
- Step 5.3 (website par customer login, httpOnly cookies): ho gaya, test pass, push hua (commit `cd738d7`).
- Step 6.1 (`Order`, `OrderItem` tables): ho gaya, push hua.
- Step 6.2 (customer order banaye, `POST /orders`): ho gaya, test pass, push hua.
- Step 6.3 (customer apne orders dekhe aur cancel kare): ho gaya, test pass, push hua.
- Step 6.4 (provider apne orders dekhe aur status badle, backend) aur Step 6.5 (customer ke website pages: menu par quantity, order dena, mere orders, cancel): **code ban gaya, testing chal rahi thi** (provider status badalne ke PowerShell tests aur website ke order wale tests). Naye chat me pehle `git status --short` aur `git log --oneline -5` chalao. Agar 6.4/6.5 ka commit nahi hua to pehle section 7 ke tests (6.4 aur 6.5) karke commit karo: `Step 6.4 and 6.5: provider order status routes, customer order pages`.
- **Agla: Step 6.6** (provider dashboard, website par). Details section 10 me.

## 2. Faisle jo tay hue

### Login
- Customer aur provider ke liye **ek hi OTP login** hai. Koi bhi number pehle `CUSTOMER` hota hai. `POST /providers` se dukaan ki profile banane par role `PROVIDER` ho jata hai. Isliye provider ke liye alag login page nahi, wahi `/login`.
- **Dhyan (6.6 ke liye zaroori):** profile banane ke baad purane token me role `CUSTOMER` hi rehta hai. Role badalne ke baad `/auth/refresh` karna padta hai tab naya token `PROVIDER` role wala milta hai. Dashboard me profile banane ke turant baad refresh karwana hoga.
- Website par cookies: `tg_access` (14 minute) aur `tg_refresh` (30 din), dono httpOnly. Browser seedha backend ko call nahi karta, isliye CORS ki zaroorat nahi.
- Login `session.ts` ke ye naam hain: `setSession`, `clearSession`, `getRefreshToken`, `safeNext`, `getSession`, `getCurrentUser(returnTo)`, `ACCESS_COOKIE`, `REFRESH_COOKIE`. `api.ts` se `API_URL` export hota hai.

### Orders (backend)
- Payment abhi sirf **COD** (`PaymentMethod` me sirf `COD`). Online payment aur wallet Step 8 me.
- Order sirf **aaj ke menu** ke items ka ho sakta hai (`dayOfWeek` aaj ka ya `null`, `isAvailable: true`, usi dukaan ka), aur dukaan `APPROVED` aur `isOpen` honi chahiye.
- **Daam server database se leta hai.** Item ka naam aur daam `OrderItem` me copy ho jata hai, taaki baad me provider daam badle to purane order na badlein.
- Ek item do baar aaye to quantity jud jati hai. Ek item ki quantity 1 se 20. Ek order me 20 se zyada alag items nahi. Total ₹1 lakh (`10_000_000` paise) se zyada nahi.
- Provider apni hi dukaan se order nahi kar sakta.
- Customer sirf `PLACED` status par cancel kar sakta hai. Check aur badlav ek hi `updateMany` query me hota hai, taaki provider ke accept ke saath takrao na ho.
- Provider ke status badalne ke rules: `PLACED` se `ACCEPTED` ya `REJECTED`; `ACCEPTED` se `PREPARING` ya `REJECTED`; `PREPARING` se `OUT_FOR_DELIVERY`; `OUT_FOR_DELIVERY` se `DELIVERED`. `DELIVERED`, `REJECTED`, `CANCELLED` ke baad kuch nahi badalta. Ye bhi ek `updateMany` query se.
- **Provider ko order me customer ka phone aur delivery ka pata dikhta hai** (delivery ke liye zaroori), sirf us order ke provider ko. Customer ko provider ka sirf `shopName` dikhta hai.
- Kisi aur ka order maango to `Order nahi mila` (404) aata hai, taaki pata na chale ki wo maujood hai.

### Website (customer)
- Cart aur checkout **alag page nahi**, provider ke menu page par hi hai (ek order me ek hi dukaan). Quantity ka state browser me (`order-form.tsx`), order server action se jata hai.
- Server pages backend ko `authedFetch` se bulate hain. Page me access token na ho to `/session/refresh?next=...` par bhejte hain (cookie badalna sirf route ya server action me ho sakta hai). Server action me khud refresh kar leta hai.
- `redirect()` try/catch ke andar mat rakho (wo ek special error phenkta hai).
- Status ke naam website par Hinglish me (`STATUS_LABEL`). Order ka page apne aap live nahi badalta, `F5` karna padta hai (tracking baad me).
- Abhi ka design sirf kaam karne wala dhaancha hai. **Final design baad me ek alag step me** (rang, hero banner, logo, photos, mobile design). Photos ke liye database me abhi koi field nahi.

### Kaam karne ka tareeka
- **Kai steps ek saath (batch) banao jab usse rework ya toot-phoot na ho**, taaki bar-bar wahi code na badalna pade. Batch A = 6.4 + 6.5. Batch B = 6.6.
- Prisma 7 me `migrate dev` ke baad **`npx prisma generate` alag se chalana padta hai**, warna code me `prisma.order` ke liye `Property 'order' does not exist` error aata hai.

## 3. Final structure (Step 5.3 se 6.5 tak)

`*` = naya, `~` = badla.

```
tiffin-ghar/
  backend/
    app.ts                         ~ providerOrdersRouter, ordersRouter jude
    middleware/rateLimit.ts        ~ orderLimiter juda
    prisma/schema.prisma           ~ Order, OrderItem, enums
    routes/
      orders.ts                    * customer orders
      providerOrders.ts            * provider orders aur status
    validators/
      order.ts                     * createOrderSchema, listOrdersQuery
      providerOrder.ts             * listProviderOrdersQuery, updateOrderStatusSchema
  web/
    src/
      lib/
        session.ts                 * login ki cookies (tumhara version)
        authed.ts                  * backend ko login ke saath bulana
        format.ts                  * formatPrice, formatDate
        orders.ts                  * Order type, STATUS_LABEL
      app/
        login/page.tsx, actions.ts * (5.3, code is notes me nahi, section 12 dekho)
        session/refresh/route.ts   * (5.3, section 12 dekho)
        provider/[id]/
          page.tsx                 ~ menu + OrderForm
          order-form.tsx           * quantity, address, order button
          actions.ts               * placeOrderAction
        orders/
          page.tsx                 * mere orders
          actions.ts               * cancelOrderAction
          [id]/page.tsx            * ek order, status, cancel button
```

## 4. Code

### Step 5.3: web/src/lib/session.ts (tumhara version)

```ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
export const ACCESS_COOKIE = "tg_access";
export const REFRESH_COOKIE = "tg_refresh";

const ACCESS_MAX_AGE = 14 * 60; // JWT 15 min ka hai, cookie thoda pehle khatam
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 din

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true, // browser ka JavaScript padh nahi sakta
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function setSession(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE));
  store.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getRefreshToken() {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

// Redirect me sirf apni website ka raasta (open redirect se bachne ke liye)
export function safeNext(value: string | null | undefined) {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

export type User = { id: number; phone: string; role: string };

export type Session =
  | { status: "user"; user: User }
  | { status: "refresh" } // access cookie nahi, par refresh cookie hai
  | { status: "guest" };

export async function getSession(): Promise<Session> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  const refresh = store.get(REFRESH_COOKIE)?.value;

  if (!access) return refresh ? { status: "refresh" } : { status: "guest" };

  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
    });
    if (!res.ok) return { status: "guest" };
    const body = await res.json();
    return { status: "user", user: (body.user ?? body) as User };
  } catch {
    return { status: "guest" };
  }
}

// Page ke liye: user ya null. Access token khatam ho par refresh route par bhej deta hai
// (cookie badalna page me nahi ho sakta, isliye route par jaate hain).
export async function getCurrentUser(returnTo: string): Promise<User | null> {
  const session = await getSession();
  if (session.status === "refresh") {
    redirect(`/session/refresh?next=${encodeURIComponent(returnTo)}`);
  }
  return session.status === "user" ? session.user : null;
}
```

`web/src/lib/api.ts` me `API_URL` **export** hona chahiye: `export const API_URL = process.env.API_URL ?? "http://localhost:5000/api/v1";`

### Step 6.1: backend/prisma/schema.prisma me jodo (neeche)

```prisma
enum OrderStatus {
  PLACED
  ACCEPTED
  PREPARING
  OUT_FOR_DELIVERY
  DELIVERED
  REJECTED
  CANCELLED
}

enum PaymentMethod {
  COD
}

model Order {
  id              Int           @id @default(autoincrement())
  userId          Int
  user            User          @relation(fields: [userId], references: [id])
  providerId      Int
  provider        Provider      @relation(fields: [providerId], references: [id])
  status          OrderStatus   @default(PLACED)
  paymentMethod   PaymentMethod @default(COD)
  totalPaise      Int
  deliveryAddress String
  note            String?
  items           OrderItem[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId, createdAt])
  @@index([providerId, status])
}

model OrderItem {
  id         Int       @id @default(autoincrement())
  orderId    Int
  order      Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId Int?
  menuItem   MenuItem? @relation(fields: [menuItemId], references: [id], onDelete: SetNull)
  name       String
  pricePaise Int
  quantity   Int
}
```

Teen purane models me ek-ek line: `model User` me `orders Order[]`, `model Provider` me `orders Order[]`, `model MenuItem` me `orderItems OrderItem[]`.

Phir (server band karke, `backend` folder me): `npx prisma migrate dev --name add_orders`, phir **`npx prisma generate`**, VS Code me `Ctrl + Shift + P`, `TypeScript: Restart TS Server`, phir `npm run dev`.

### backend/validators/order.ts

```ts
import { z } from "zod";

const id = z
  .number("Sahi id bhejo")
  .int("Sahi id bhejo")
  .min(1, "Sahi id bhejo")
  .max(2_147_483_647, "Sahi id bhejo");

export const createOrderSchema = z.object({
  providerId: id,
  items: z
    .array(
      z.object({
        menuItemId: id,
        quantity: z
          .number("Quantity number me daalo")
          .int("Quantity poora number ho")
          .min(1, "Quantity 1 se 20 ke beech rakho")
          .max(20, "Quantity 1 se 20 ke beech rakho"),
      }),
      "Items ki list bhejo",
    )
    .min(1, "Kam se kam ek item chuno")
    .max(20, "Ek order me 20 se zyada alag items nahi ho sakte"),
  deliveryAddress: z
    .string("Delivery ka pata likho")
    .trim()
    .min(10, "Delivery ka poora pata likho")
    .max(250, "Pata 250 akshar se chhota rakho"),
  note: z.string().trim().max(200, "Note 200 akshar se chhota rakho").optional(),
});

export const listOrdersQuery = z.object({
  page: z.coerce.number().int().min(1, "Page 1 ya usse bada hona chahiye").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit 1 se 50 ke beech rakho")
    .max(50, "Limit 1 se 50 ke beech rakho")
    .default(20),
});
```

### backend/middleware/rateLimit.ts

Sabse neeche ye line jodi:

```ts
export const orderLimiter = make(15 * 60_000, 20, "Bahut zyada orders, thodi der baad try karo");
```

### backend/routes/orders.ts (Step 6.2 aur 6.3)

```ts
import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { orderLimiter } from "../middleware/rateLimit.js";
import { createOrderSchema, listOrdersQuery } from "../validators/order.js";
import { todayInIndia } from "../lib/time.js";

const router = Router();

// Is router ke saare routes ke liye login zaroori
router.use(requireAuth);

const orderInclude = {
  items: { select: { id: true, name: true, pricePaise: true, quantity: true } },
  provider: { select: { id: true, shopName: true } },
};

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

// Mere orders (naya pehle)
router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const parsed = listOrdersQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { page, limit } = parsed.data;
    const where = { userId: req.auth!.userId };

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

// Mera ek order
router.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat order id" });

    const order = await prisma.order.findFirst({
      where: { id, userId: req.auth!.userId },
      include: orderInclude,
    });
    if (!order) return res.status(404).json({ error: "Order nahi mila" });

    res.json(order);
  } catch (e) {
    next(e);
  }
});

// Order cancel (sirf jab tak provider ne accept nahi kiya)
router.patch("/:id/cancel", async (req: AuthedRequest, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat order id" });
    const userId = req.auth!.userId;

    // Ek hi query me check aur badlav, taaki accept aur cancel ek saath ho to dikkat na ho
    const result = await prisma.order.updateMany({
      where: { id, userId, status: "PLACED" },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) {
      const existing = await prisma.order.findFirst({
        where: { id, userId },
        select: { status: true },
      });
      if (!existing) return res.status(404).json({ error: "Order nahi mila" });
      if (existing.status === "CANCELLED") {
        return res.status(409).json({ error: "Order pehle hi cancel ho chuka hai" });
      }
      return res.status(409).json({ error: "Ab ye order cancel nahi ho sakta" });
    }

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: orderInclude,
    });
    res.json(order);
  } catch (e) {
    next(e);
  }
});

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
      include: orderInclude,
    });

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

export default router;
```

### Step 6.4: backend/validators/providerOrder.ts

```ts
import { z } from "zod";

const ALL_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
] as const;

export const listProviderOrdersQuery = z.object({
  status: z.enum(ALL_STATUSES, "Status galat hai").optional(),
  page: z.coerce.number().int().min(1, "Page 1 ya usse bada hona chahiye").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit 1 se 50 ke beech rakho")
    .max(50, "Limit 1 se 50 ke beech rakho")
    .default(20),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ["ACCEPTED", "REJECTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"],
    "Status galat hai",
  ),
});
```

### backend/routes/providerOrders.ts

```ts
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
```

### backend/app.ts (imports aur routes ka order)

Upar imports me ye do jude hain:

```ts
import ordersRouter from "./routes/orders.js";
import providerOrdersRouter from "./routes/providerOrders.js";
```

Routes ka **order zaroori hai**:

```ts
api.use("/auth", authRouter);
api.use("/providers/me/menu", menuRouter);
api.use("/providers/me/orders", providerOrdersRouter);
api.use("/providers", providersRouter);
api.use("/providers", publicProvidersRouter);
api.use("/orders", ordersRouter);
```

### Step 6.5: web/src/lib/format.ts

```ts
// Paise ko rupaye me dikhao: 8500 -> ₹85
export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
```

### web/src/lib/orders.ts

```ts
export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: "Order mil gaya, dukaan ke jawab ka intezaar",
  ACCEPTED: "Dukaan ne accept kar liya",
  PREPARING: "Ban raha hai",
  OUT_FOR_DELIVERY: "Raaste me hai",
  DELIVERED: "Pahunch gaya",
  REJECTED: "Dukaan ne mana kar diya",
  CANCELLED: "Cancel ho gaya",
};

export type OrderItem = {
  id: number;
  name: string;
  pricePaise: number;
  quantity: number;
};

export type Order = {
  id: number;
  status: OrderStatus;
  paymentMethod: string;
  totalPaise: number;
  deliveryAddress: string;
  note: string | null;
  createdAt: string;
  provider: { id: number; shopName: string };
  items: OrderItem[];
};
```

### web/src/lib/authed.ts

Login wale backend routes ko bulane ka ek hi tareeka. `mode: "page"` (server page): access token na ho ya 401 aaye to `/session/refresh` par bhejta hai. `mode: "action"` (server action): wahin refresh kar leta hai.

```ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, setSession, clearSession } from "@/lib/session";

type Options = {
  mode: "page" | "action";
  returnTo: string; // login ya refresh ke baad yahin wapas aayenge
  method?: string;
  body?: unknown;
};

async function refreshInline(): Promise<string | null> {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    });
    if (!res.ok) {
      await clearSession();
      return null;
    }
    const data = await res.json();
    await setSession(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

async function call(path: string, token: string, opts: Options) {
  try {
    return await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: "no-store",
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server se jud nahi paye, baad me try karo" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function authedFetch(path: string, opts: Options): Promise<Response> {
  const next = encodeURIComponent(opts.returnTo);
  const store = await cookies();
  let access = store.get(ACCESS_COOKIE)?.value ?? null;

  if (!access) {
    if (opts.mode === "page") {
      if (store.get(REFRESH_COOKIE)) redirect(`/session/refresh?next=${next}`);
      redirect(`/login?next=${next}`);
    }
    access = await refreshInline();
    if (!access) redirect(`/login?next=${next}`);
  }

  let res = await call(path, access, opts);

  if (res.status === 401) {
    if (opts.mode === "page") redirect(`/session/refresh?next=${next}`);
    const fresh = await refreshInline();
    if (!fresh) redirect(`/login?next=${next}`);
    res = await call(path, fresh, opts);
  }

  return res;
}
```

### web/src/app/provider/[id]/actions.ts

```ts
"use server";

import { redirect } from "next/navigation";
import { authedFetch } from "@/lib/authed";

export type OrderState = { error: string };

export async function placeOrderAction(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const providerId = Number(formData.get("providerId"));
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "");
  const note = String(formData.get("note") ?? "");

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Items galat hain, page reload karo" };
  }

  const res = await authedFetch("/orders", {
    mode: "action",
    returnTo: `/provider/${providerId}`,
    method: "POST",
    body: { providerId, items, deliveryAddress, note: note || undefined },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) return { error: data?.error ?? "Kuch gadbad hui, baad me try karo" };

  redirect(`/orders/${data.id}`);
}
```

### web/src/app/provider/[id]/order-form.tsx

```tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { placeOrderAction, type OrderState } from "./actions";
import { formatPrice } from "@/lib/format";

type Item = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
};

const initial: OrderState = { error: "" };
const MAX_QTY = 20;

export default function OrderForm({
  providerId,
  items,
  loggedIn,
}: {
  providerId: number;
  items: Item[];
  loggedIn: boolean;
}) {
  const [qty, setQty] = useState<Record<number, number>>({});
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [state, action, pending] = useActionState(placeOrderAction, initial);

  const lines = items
    .filter((i) => (qty[i.id] ?? 0) > 0)
    .map((i) => ({ menuItemId: i.id, quantity: qty[i.id] ?? 0 }));
  const total = items.reduce((sum, i) => sum + i.pricePaise * (qty[i.id] ?? 0), 0);

  function change(id: number, delta: number) {
    setQty((prev) => {
      const next = Math.min(MAX_QTY, Math.max(0, (prev[id] ?? 0) + delta));
      return { ...prev, [id]: next };
    });
  }

  return (
    <div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  <span
                    className={item.isVeg ? "text-green-600" : "text-red-600"}
                    title={item.isVeg ? "Veg" : "Non-veg"}
                  >
                    &#9679;
                  </span>{" "}
                  {item.name}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
                <p className="mt-1 font-semibold">{formatPrice(item.pricePaise)}</p>
              </div>

              {loggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => change(item.id, -1)}
                    className="h-8 w-8 rounded border"
                    aria-label="Kam karo"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{qty[item.id] ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => change(item.id, 1)}
                    className="h-8 w-8 rounded border"
                    aria-label="Badhao"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {!loggedIn && (
        <p className="mt-6 rounded border p-4">
          Order dene ke liye pehle{" "}
          <Link href={`/login?next=${encodeURIComponent(`/provider/${providerId}`)}`} className="text-orange-600">
            login karo
          </Link>
          .
        </p>
      )}

      {loggedIn && items.length > 0 && (
        <form action={action} className="mt-6 space-y-3 rounded border p-4">
          <input type="hidden" name="providerId" value={providerId} />
          <input type="hidden" name="items" value={JSON.stringify(lines)} />

          <h3 className="text-lg font-semibold">Aapka order</h3>
          {lines.length === 0 ? (
            <p className="text-sm text-gray-600">Upar se items chuno (+ dabao).</p>
          ) : (
            <p className="text-sm text-gray-600">
              {lines.length} item, total {formatPrice(total)} (payment: COD, delivery par)
            </p>
          )}

          <textarea
            name="deliveryAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            minLength={10}
            maxLength={250}
            rows={3}
            placeholder="Delivery ka poora pata"
            className="w-full rounded border px-3 py-2"
          />
          <input
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Dukaan ke liye note (optional)"
            className="w-full rounded border px-3 py-2"
          />

          <button
            disabled={pending || lines.length === 0}
            className="w-full rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {pending ? "Ruko..." : "Order karo"}
          </button>

          {state.error && <p className="text-red-600">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
```

### web/src/app/provider/[id]/page.tsx

```tsx
import Link from "next/link";
import { getMenu } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import OrderForm from "./order-form";

const DAY_NAMES = [
  "Ravivar",
  "Somvar",
  "Mangalvar",
  "Budhvar",
  "Guruvar",
  "Shukravar",
  "Shanivar",
];

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser(`/provider/${id}`);
  const data = await getMenu(id);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; Wapas
        </Link>
        <p className="mt-6 text-gray-600">Ye dukaan abhi band hai ya mili nahi.</p>
      </main>
    );
  }

  const { provider, day, items } = data;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/?city=${encodeURIComponent(provider.city)}`}
          className="text-orange-600"
        >
          &larr; {provider.city} ki dukaanein
        </Link>
        {user && (
          <Link href="/orders" className="text-orange-600">
            Mere orders
          </Link>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-bold">{provider.shopName}</h1>
      <p className="text-gray-600">
        {provider.city} - {provider.pincode}
      </p>

      <h2 className="mt-6 text-xl font-semibold">Aaj ka menu ({DAY_NAMES[day]})</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-gray-600">Aaj ke liye abhi koi item nahi hai.</p>
      ) : (
        <OrderForm providerId={provider.id} items={items} loggedIn={!!user} />
      )}
    </main>
  );
}
```

### web/src/app/orders/actions.ts

```ts
"use server";

import { redirect } from "next/navigation";
import { authedFetch } from "@/lib/authed";

export async function cancelOrderAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!/^\d{1,10}$/.test(id)) redirect("/orders");

  await authedFetch(`/orders/${id}/cancel`, {
    mode: "action",
    returnTo: `/orders/${id}`,
    method: "PATCH",
  });

  // Chahe cancel hua ho ya nahi, page par order ka asli status dikhega
  redirect(`/orders/${id}`);
}
```

### web/src/app/orders/page.tsx

```tsx
import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_LABEL, type Order } from "@/lib/orders";

const LIMIT = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const res = await authedFetch(`/orders?page=${page}&limit=${LIMIT}`, {
    mode: "page",
    returnTo: page > 1 ? `/orders?page=${page}` : "/orders",
  });

  const data = res.ok
    ? ((await res.json()) as { items: Order[]; total: number })
    : null;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Mere orders</h1>

      {!data && <p className="mt-4 text-red-600">Orders nahi la paye, baad me try karo.</p>}

      {data && data.items.length === 0 && (
        <p className="mt-4 text-gray-600">Abhi tak koi order nahi diya.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-3">
          {data.items.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="block rounded border p-4 hover:bg-orange-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{o.provider.shopName}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(o.createdAt)} - {o.items.length} item
                    </p>
                    <p className="mt-1 text-sm">{STATUS_LABEL[o.status]}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(o.totalPaise)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.total > page * LIMIT && (
        <p className="mt-6">
          <Link href={`/orders?page=${page + 1}`} className="text-orange-600">
            Aur purane orders &rarr;
          </Link>
        </p>
      )}
    </main>
  );
}
```

### web/src/app/orders/[id]/page.tsx

```tsx
import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_LABEL, type Order } from "@/lib/orders";
import { cancelOrderAction } from "../actions";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await authedFetch(`/orders/${encodeURIComponent(id)}`, {
    mode: "page",
    returnTo: `/orders/${id}`,
  });

  if (res.status === 404 || res.status === 400) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/orders" className="text-orange-600">
          &larr; Mere orders
        </Link>
        <p className="mt-6 text-gray-600">Ye order nahi mila.</p>
      </main>
    );
  }

  if (!res.ok) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/orders" className="text-orange-600">
          &larr; Mere orders
        </Link>
        <p className="mt-6 text-red-600">Order nahi la paye, baad me try karo.</p>
      </main>
    );
  }

  const order = (await res.json()) as Order;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/orders" className="text-orange-600">
        &larr; Mere orders
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Order #{order.id}</h1>
      <p className="text-gray-600">
        {order.provider.shopName} - {formatDate(order.createdAt)}
      </p>

      <p className="mt-4 rounded border p-3 font-semibold">{STATUS_LABEL[order.status]}</p>

      <ul className="mt-6 space-y-2">
        {order.items.map((it) => (
          <li key={it.id} className="flex justify-between gap-4">
            <span>
              {it.name} x {it.quantity}
            </span>
            <span>{formatPrice(it.pricePaise * it.quantity)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex justify-between border-t pt-3 font-semibold">
        <span>Total (COD, delivery par)</span>
        <span>{formatPrice(order.totalPaise)}</span>
      </p>

      <div className="mt-6 text-sm text-gray-600">
        <p>Delivery ka pata: {order.deliveryAddress}</p>
        {order.note && <p className="mt-1">Note: {order.note}</p>}
      </div>

      {order.status === "PLACED" && (
        <form action={cancelOrderAction} className="mt-6">
          <input type="hidden" name="id" value={order.id} />
          <button className="rounded border border-red-600 px-4 py-2 text-red-600">
            Order cancel karo
          </button>
        </form>
      )}
    </main>
  );
}
```

### Home page par "Mere orders" link (optional)

`web/src/app/page.tsx` me jahan phone number aur **Logout** button dikhta hai, **Logout** se pehle ye jodo (`Link` import pehle se hai):

```tsx
<Link href="/orders" className="text-orange-600">
  Mere orders
</Link>
```

## 5. Saare API routes (abhi tak)

| Route | Kaun | Kaam |
|---|---|---|
| `POST /api/v1/auth/send-otp` | sab | OTP maango |
| `POST /api/v1/auth/verify-otp` | sab | `accessToken`, `refreshToken`, `user` |
| `POST /api/v1/auth/refresh` | sab | naya access + naya refresh token |
| `POST /api/v1/auth/logout` | sab | refresh token band |
| `GET /api/v1/me` | login | apna user |
| `POST /api/v1/providers` | login | provider profile banao (role `PROVIDER` ho jata hai, naya token refresh se milta hai) |
| `GET /api/v1/providers/me` | provider | meri profile |
| `PATCH /api/v1/providers/me` | provider | profile badlo |
| `PATCH /api/v1/providers/me/open` | provider | dukaan khula/band (sirf `APPROVED` par) |
| `GET /api/v1/providers/me/menu` | provider | meri menu |
| `POST /api/v1/providers/me/menu` | provider | naya item |
| `PATCH /api/v1/providers/me/menu/:id` | provider | item badlo |
| `DELETE /api/v1/providers/me/menu/:id` | provider | item hatao |
| `GET /api/v1/providers/me/orders` | provider | meri dukaan ke orders (`?status=`, `page`, `limit`), customer ka `user.phone` aur `deliveryAddress` ke saath |
| `GET /api/v1/providers/me/orders/:id` | provider | ek order |
| `PATCH /api/v1/providers/me/orders/:id/status` | provider | status badlo (body: `{"status":"ACCEPTED"}`) |
| `GET /api/v1/providers?city=...` | sab | approved aur khule providers ki list |
| `GET /api/v1/providers/:id/menu` | sab | us provider ka aaj ka menu |
| `POST /api/v1/orders` | login | order banao (body: `providerId`, `items: [{menuItemId, quantity}]`, `deliveryAddress`, `note`) |
| `GET /api/v1/orders` | login | mere orders (`page`, `limit`) |
| `GET /api/v1/orders/:id` | login | mera ek order |
| `PATCH /api/v1/orders/:id/cancel` | login | order cancel (sirf `PLACED` par) |

## 6. Login commands (har test se pehle)

`backend` folder wale terminal me chalao (server wala terminal nahi, wo `npm run dev` se chalta rehta hai). **Har command alag line par, har ke baad Enter.** Variable banane wali commands (`$r2 = ...`, `$access2 = ...`) kuch print nahi karti, ye theek hai. Token ko chat ya screenshot me mat dikhao. Naya terminal kholne par saare `$` variables khali ho jate hain, tab login dobara karna padta hai.

### Customer login (`9999999999`): `$access2` aur `$refresh2`

OTP maango (pehle maanga ho to 60 second ruko):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999"}'
```

OTP **server wale terminal** me `OTP for 9999999999: ......` dikhega. Phir (`ASLI_OTP` ki jagah wo 6 digit):

```
$r2 = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999","code":"ASLI_OTP"}'
```
```
$access2 = $r2.accessToken
```
```
$refresh2 = $r2.refreshToken
```
```
$access2.Length, $refresh2.Length
```
(`$refresh2` ki lambai 96.)

### Provider login (`8888888888`): `$access` aur `$refresh`

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"8888888888"}'
```

OTP server terminal me dekho, phir:

```
$r = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"8888888888","code":"ASLI_OTP"}'
```
```
$access = $r.accessToken
```
```
$refresh = $r.refreshToken
```
```
$access.Length, $refresh.Length
```

### Access token expire ho gaya? (15 minute me hota hai)

`Token galat ya expire hai` aaye to OTP ki jagah refresh token se naya lo. Customer:

```
$n2 = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/refresh -Method Post -ContentType "application/json" -Body (@{ refreshToken = $refresh2 } | ConvertTo-Json)
```
```
$refresh2 = $n2.refreshToken
```
```
$access2 = $n2.accessToken
```

Provider:

```
$n = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/refresh -Method Post -ContentType "application/json" -Body (@{ refreshToken = $refresh } | ConvertTo-Json)
```
```
$refresh = $n.refreshToken
```
```
$access = $n.accessToken
```

Naya `$refresh` save karna zaroori hai, purana band ho jata hai. Refresh par bhi `Session khatam ho gaya` aaye to OTP se dobara login karo.

### Website par login (browser me)

`http://localhost:3000/login` par number likho, **OTP bhejo**, OTP **backend wale terminal** me dekho, daalo, **Login karo**. Cookies check: Chrome me `F12`, **Application** tab (agar na dikhe to tabs ke `>>` me), **Storage** me **Cookies**, `http://localhost:3000`, table ke refresh icon se reload. `tg_access` aur `tg_refresh` dikhne chahiye, **HttpOnly** me tick ke saath (`ajs_anonymous_id` cookie kisi extension ki hai, ignore).

## 7. Step 6 ke tests

### 7.1 Step 6.1: tables ban gayi?

`backend` folder me. Server band karke:

```
npx prisma migrate status
```
`Database schema is up to date` aana chahiye. Phir:
```
npx prisma generate
```
```
npx prisma studio
```
`Order` aur `OrderItem` tables dikhni chahiye. Band karne ke liye `Ctrl + C`. Phir `npm run dev`.

### 7.2 Step 6.2: order dena (customer)

**Taiyari: aaj ke menu ki item `id` dekho.** Sirf aaj ke din ke aur har din wale items aate hain, wahi order ho sakte hain:

```
$m = Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/1/menu
```
```
$m.items
```

Jo `id` dikhe (neeche `2` ki jagah wahi likho) uska order do. `$m.items` khali aaye to aaj ke din ka ya har din wala item banao (menu ke tests, section 8, I).

**A. Order dena:**

```
$body = @{ providerId = 1; items = @(@{ menuItemId = 2; quantity = 2 }); deliveryAddress = "Flat 12, Civil Lines, Prayagraj"; note = "Kam teekha" } | ConvertTo-Json -Depth 5
```
```
$o = Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body $body
```
```
$oid = $o.id
```
```
$oid
```
```
$o
```
Aana chahiye: `status: PLACED`, `paymentMethod: COD`, `totalPaise` (daam x quantity), `items` me naam, daam, quantity, aur `provider.shopName`. `$oid` ek number hona chahiye.

**B. Bina login ke** (aana chahiye `Login zaroori hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Body $body } catch { $_.ErrorDetails.Message }
```

**C. Apni hi dukaan se order** (provider ke token se, aana chahiye `Aap apni hi dukaan se order nahi kar sakte`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body $body } catch { $_.ErrorDetails.Message }
```

**D. Khali items** (aana chahiye `Kam se kam ek item chuno`):

```
$b = @{ providerId = 1; items = @(); deliveryAddress = "Flat 12, Civil Lines, Prayagraj" } | ConvertTo-Json -Depth 5
```
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body $b } catch { $_.ErrorDetails.Message }
```

**E. Quantity 0** (aana chahiye `Quantity 1 se 20 ke beech rakho`):

```
$b = @{ providerId = 1; items = @(@{ menuItemId = 2; quantity = 0 }); deliveryAddress = "Flat 12, Civil Lines, Prayagraj" } | ConvertTo-Json -Depth 5
```
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body $b } catch { $_.ErrorDetails.Message }
```

**F. Chhota pata** (aana chahiye `Delivery ka poora pata likho`):

```
$b = @{ providerId = 1; items = @(@{ menuItemId = 2; quantity = 1 }); deliveryAddress = "Ghar" } | ConvertTo-Json -Depth 5
```
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body $b } catch { $_.ErrorDetails.Message }
```

**G. Na-maujood item** (aana chahiye `Kuch items aaj ke menu me nahi hain ya band hain`):

```
$b = @{ providerId = 1; items = @(@{ menuItemId = 9999; quantity = 1 }); deliveryAddress = "Flat 12, Civil Lines, Prayagraj" } | ConvertTo-Json -Depth 5
```
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body $b } catch { $_.ErrorDetails.Message }
```

**H. Na-maujood dukaan** (aana chahiye `Ye dukaan abhi band hai ya mili nahi`):

```
$b = @{ providerId = 9999; items = @(@{ menuItemId = 2; quantity = 1 }); deliveryAddress = "Flat 12, Civil Lines, Prayagraj" } | ConvertTo-Json -Depth 5
```
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body $b } catch { $_.ErrorDetails.Message }
```

**I. Ek item do baar** (ek hi line, `quantity` 3 aani chahiye):

```
$b = @{ providerId = 1; items = @(@{ menuItemId = 2; quantity = 1 }, @{ menuItemId = 2; quantity = 2 }); deliveryAddress = "Flat 12, Civil Lines, Prayagraj" } | ConvertTo-Json -Depth 5
```
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body $b
```

**J. Database me dekho** (`backend` folder me, band karne ke liye `Ctrl + C`):

```
npx prisma studio
```
`Order` table me naye orders, `OrderItem` me unke items. `userId` wo jo `9999999999` ka hai.

### 7.3 Step 6.3: mere orders dekho aur cancel karo (customer)

Neeche `1` ya `2` ki jagah apne order ki `id` (list A se dekho), ya naya order banake `$oid` use karo.

**A. Mere orders** (naya pehle, har ek me `items` aur `provider.shopName`):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Headers @{ Authorization = "Bearer $access2" } | ConvertTo-Json -Depth 6
```

**B. Ek order:**

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid -Headers @{ Authorization = "Bearer $access2" } | ConvertTo-Json -Depth 6
```

**C. Kisi aur ka order** (provider ke token se, aana chahiye `Order nahi mila`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid -Headers @{ Authorization = "Bearer $access" } } catch { $_.ErrorDetails.Message }
```

**D. Bina login ke** (aana chahiye `Login zaroori hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders } catch { $_.ErrorDetails.Message }
```

**E. Galat id** (aana chahiye `Galat order id`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/abc -Headers @{ Authorization = "Bearer $access2" } } catch { $_.ErrorDetails.Message }
```

**F. Pagination** (`items` me ek order, `total` poora count):

```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/orders?limit=1&page=2" -Headers @{ Authorization = "Bearer $access2" } | ConvertTo-Json -Depth 6
```
Galat limit (aana chahiye `Limit 1 se 50 ke beech rakho`):
```
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/orders?limit=0" -Headers @{ Authorization = "Bearer $access2" } } catch { $_.ErrorDetails.Message }
```

**G. Order cancel** (jiska `status` `PLACED` hai; `CANCELLED` aana chahiye):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/cancel -Method Patch -Headers @{ Authorization = "Bearer $access2" }
```

**H. Dobara cancel** (aana chahiye `Order pehle hi cancel ho chuka hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/cancel -Method Patch -Headers @{ Authorization = "Bearer $access2" } } catch { $_.ErrorDetails.Message }
```

**I. Kisi aur ka order cancel** (provider ke token se, aana chahiye `Order nahi mila`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/cancel -Method Patch -Headers @{ Authorization = "Bearer $access" } } catch { $_.ErrorDetails.Message }
```

**J. Accept ho chuke order ka cancel.** Naya `PLACED` order banao (7.2 A), use provider se `ACCEPTED` karo (7.4 G ki pehli command), phir (aana chahiye `Ab ye order cancel nahi ho sakta`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/cancel -Method Patch -Headers @{ Authorization = "Bearer $access2" } } catch { $_.ErrorDetails.Message }
```

### 7.4 Step 6.4: provider orders aur status

**Taiyari: naya `PLACED` order** (7.2 A ki `$body`, `$o`, `$oid` commands). Purana `CANCELLED` order status test ke kaam ka nahi.

**A. Provider ke orders** (naya pehle, har order me `user.phone` aur `deliveryAddress`):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders -Headers @{ Authorization = "Bearer $access" } | ConvertTo-Json -Depth 6
```

**B. Sirf `PLACED` orders:**

```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/orders?status=PLACED" -Headers @{ Authorization = "Bearer $access" } | ConvertTo-Json -Depth 6
```
Galat status (aana chahiye `Status galat hai`):
```
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/orders?status=ABC" -Headers @{ Authorization = "Bearer $access" } } catch { $_.ErrorDetails.Message }
```

**C. Ek order:**

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid -Headers @{ Authorization = "Bearer $access" } | ConvertTo-Json -Depth 6
```

**D. Customer provider ke routes nahi chala sakta** (aana chahiye `Aapko ye karne ki ijazat nahi hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders -Headers @{ Authorization = "Bearer $access2" } } catch { $_.ErrorDetails.Message }
```

**E. Bina login ke** (aana chahiye `Login zaroori hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders } catch { $_.ErrorDetails.Message }
```

**F. Seedha `DELIVERED` (galat raasta).** Aana chahiye `Order abhi PLACED hai, isse DELIVERED nahi kar sakte`:

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"DELIVERED"}' } catch { $_.ErrorDetails.Message }
```

**G. Poora sahi raasta.** Ek-ek karke, har ek me `status` badla hua aana chahiye:

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"ACCEPTED"}'
```
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"PREPARING"}'
```
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"OUT_FOR_DELIVERY"}'
```
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"DELIVERED"}'
```

**H. `DELIVERED` ke baad kuch nahi badalta** (aana chahiye `Order abhi DELIVERED hai, isse REJECTED nahi kar sakte`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"REJECTED"}' } catch { $_.ErrorDetails.Message }
```

**I. Galat status naam** (aana chahiye `Status galat hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"PLACED"}' } catch { $_.ErrorDetails.Message }
```

**J. Reject ka raasta.** Naya order banao (7.2 A), phir:

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"REJECTED"}'
```
Phir accept (aana chahiye `Order abhi REJECTED hai, isse ACCEPTED nahi kar sakte`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/orders/$oid/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"status":"ACCEPTED"}' } catch { $_.ErrorDetails.Message }
```

**K. Customer ko status dikhna** (wahi status jo provider ne kiya):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid -Headers @{ Authorization = "Bearer $access2" }
```

### 7.5 Step 6.5: website par order (Chrome me)

Backend (`backend` folder me) aur website (`web` folder me) dono `npm run dev` se chalte hon. Naye folder ya file banane par server na pakde to `Ctrl + C` karke `npm run dev` dobara chalao.

1. **Bina login:** `http://localhost:3000/provider/1`. Menu dikhna chahiye, `+` `-` buttons nahi, aur neeche `Order dene ke liye pehle login karo`.
2. **Login:** customer number se login karo, OTP backend terminal me dekho.
3. **Order do:** menu par kisi item ke `+` dabao, neeche `Aapka order` me total badlega. Delivery ka pata likho (kam se kam 10 akshar), **Order karo** dabao.
4. **Order page:** `/orders/<id>` par `Order mil gaya, dukaan ke jawab ka intezaar`, items, total, pata, aur **Order cancel karo** button.
5. **Mere orders:** `http://localhost:3000/orders`. Naya order sabse upar.
6. **Status badalna:** PowerShell se (7.4 G) order ko `ACCEPTED` karo, website par `F5`. `Dukaan ne accept kar liya` dikhna chahiye aur cancel button hat jana chahiye.
7. **Cancel:** naya order do, **Order cancel karo** dabao. `Cancel ho gaya` dikhna chahiye.
8. **Provider apni dukaan se:** `8888888888` se login karke us dukaan ka order do. `Aap apni hi dukaan se order nahi kar sakte` laal rang me aana chahiye.
9. **Khali ya chhota pata:** 10 akshar se chhota ho to browser khud rok dega.
10. **Cookie expire:** `F12`, **Application**, **Cookies**, `tg_access` delete karo, phir order do. Order ban jana chahiye (server action khud naya token le leta hai).

### 7.6 Git

`tiffin-ghar` folder se:

```
git status --short
```
`.env`, `.env.local`, `node_modules`, `.next` nahi dikhna chahiye. Phir:
```
git add .
```
```
git commit -m "Step 6.4 and 6.5: provider order status routes, customer order pages"
```
```
git push
```
```
git log --oneline -5
```

## 8. Purane tests (Step 1 se 5.2)

Ye tests pehle ban chuke hain. Login ke variables (`$access`, `$access2`, `$refresh`) section 6 se banao, phir inme se jo chahiye chalao. Neeche ke "B" aur "B2" wale login hisse section 6 jaise hi hain.
Backend ek terminal me `npm run dev` se chalta rahe (`backend` folder me), ye commands dusre terminal me (`...\backend>` me). **Har command alag line par chalao, har ke baad Enter.** Variable banane wali commands (`$r = ...`, `$access = ...`) kuch print nahi karti, ye theek hai. Token ko print ya chat me paste mat karo.

### A. Server chal raha hai
```
Invoke-RestMethod -Uri http://localhost:5000/
```
Aana chahiye: `Tiffin Ghar API chal rahi hai`

### B. Login (OTP, accessToken, refreshToken)

OTP maango (pehle se maanga ho to 60 second ruko):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"8888888888"}'
```
OTP **server wale terminal** me `OTP for 8888888888: ......` dikhega. Phir (`ASLI_OTP` ki jagah wo 6 digit):
```
$r = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"8888888888","code":"ASLI_OTP"}'
```
```
$access = $r.accessToken
```
```
$refresh = $r.refreshToken
```
Check (`$refresh` ki lambai 96 honi chahiye):
```
$access.Length, $refresh.Length
```

**Customer ke liye alag login** (provider route par 403 test ke liye), number `9999999999`:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999"}'
```
```
$r2 = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999","code":"ASLI_OTP"}'
```
```
$access2 = $r2.accessToken
```

### B2. Access token expire ho gaya? (15 minute me hota hai)

`Token galat ya expire hai` aaye to refresh token se naya lo (har command alag line par):
```
$n = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/refresh -Method Post -ContentType "application/json" -Body (@{ refreshToken = $refresh } | ConvertTo-Json)
```
```
$refresh = $n.refreshToken
```
```
$access = $n.accessToken
```
`$refresh` bhi naya save karna zaroori hai, purana band ho jata hai. Naya terminal kholne par ye variables khali hote hain, tab B se dobara login karo.

### C. /me
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/me -Headers @{ Authorization = "Bearer $access" }
```
Aana chahiye: user (`id`, `phone`, `role`, `createdAt`).

Bina token ke (aana chahiye `Login zaroori hai`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/me } catch { $_.ErrorDetails.Message }
```
Nakli token ke saath (aana chahiye `Token galat ya expire hai, dobara login karo`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/me -Headers @{ Authorization = "Bearer nakli.token.yahan" } } catch { $_.ErrorDetails.Message }
```

### D. Galat input (zod validation)

Galat phone (aana chahiye `Sahi 10 digit ka mobile number daalo`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"123"}' } catch { $_.ErrorDetails.Message }
```
Galat OTP (aana chahiye `OTP galat hai`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"8888888888","code":"000000"}' } catch { $_.ErrorDetails.Message }
```
Galat refresh token format (aana chahiye `Refresh token galat hai`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/refresh -Method Post -ContentType "application/json" -Body '{"refreshToken":"abc"}' } catch { $_.ErrorDetails.Message }
```

### E. Rate limit (optional)
```
1..12 | ForEach-Object { try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999"}' } catch { $_.ErrorDetails.Message } }
```
Shuru me `1 minute baad` wala error, 11ve se `Bahut zyada OTP requests` aana chahiye. Server restart par limit hat jati hai.

### F. Refresh token (rotation)

Refresh karo aur naye token rakho:
```
$old = $refresh
```
```
$n = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/refresh -Method Post -ContentType "application/json" -Body (@{ refreshToken = $refresh } | ConvertTo-Json)
```
```
$refresh = $n.refreshToken
```
```
$access = $n.accessToken
```
Phir `/me` (section C) dobara chalao, chalna chahiye.

Purana token dobara use (aana chahiye `Session khatam ho gaya, dobara login karo`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/refresh -Method Post -ContentType "application/json" -Body (@{ refreshToken = $old } | ConvertTo-Json) } catch { $_.ErrorDetails.Message }
```
Ab naya wala bhi band ho gaya hoga (poori family band), wahi error aana chahiye:
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/refresh -Method Post -ContentType "application/json" -Body (@{ refreshToken = $refresh } | ConvertTo-Json) } catch { $_.ErrorDetails.Message }
```
Iske baad dobara login karna padega (section B).

### G. Logout
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/logout -Method Post -ContentType "application/json" -Body (@{ refreshToken = $refresh } | ConvertTo-Json)
```
Aana chahiye: `Logout ho gaya`. Phir wahi token se refresh karo (section F ki refresh command), `Session khatam ho gaya` aana chahiye.

### H. Provider profile (login `8888888888` se)

Profile banao (`status: PENDING` aana chahiye):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"shopName":"Sharma Tiffin","city":"Prayagraj","address":"Civil Lines, Prayagraj","pincode":"211001"}'
```
Refresh karne se pehle `/me` (aana chahiye `Aapko ye karne ki ijazat nahi hai`, kyunki token me role purana hai):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me -Headers @{ Authorization = "Bearer $access" } } catch { $_.ErrorDetails.Message }
```
Refresh karke (section B2 ki commands) naya `$access` lo, phir:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me -Headers @{ Authorization = "Bearer $access" }
```
Profile badlo:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"shopName":"Sharma Ghar Ka Tiffin"}'
```
Galat pincode (aana chahiye `6 digit ka pincode daalo`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"pincode":"12"}' } catch { $_.ErrorDetails.Message }
```
Approve se pehle dukaan kholna (aana chahiye `Profile abhi approve nahi hui hai`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/open -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"isOpen":true}' } catch { $_.ErrorDetails.Message }
```
Approve karne ke liye alag terminal me `backend` folder me `npx prisma studio` chalao, `Provider` table me `status` ko `APPROVED` karke Save karo. Phir wahi `open` command dobara chalao, `isOpen: True` aana chahiye. Band karne ke liye `{"isOpen":false}`:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/open -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"isOpen":false}'
```

### I. Menu (provider `8888888888`)

Item banao (daam paise me, ₹85 = 8500):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"name":"Dal Chawal Tiffin","description":"Dal, chawal, sabzi, 2 roti","pricePaise":8500,"dayOfWeek":1}'
```
Har din wala item (`dayOfWeek` ke bina):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"name":"Roti Sabzi","pricePaise":6000}'
```
Aaj ke din wala item (`dayOfWeek` aaj ka daalo: Sunday 0 ... Saturday 6; ye India ke time se aaj ka din hona chahiye):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"name":"Aaj Ka Special","pricePaise":9500,"dayOfWeek":3}'
```
Menu dekho:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Headers @{ Authorization = "Bearer $access" }
```
Item badlo (`1` ki jagah apne item ka `id`):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu/1 -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"pricePaise":9000,"isAvailable":false}'
```
Galat daam, decimal (aana chahiye `Daam paise me, poora number daalo (₹85 = 8500)`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"name":"Test","pricePaise":85.5}' } catch { $_.ErrorDetails.Message }
```
Kisi aur ka ya na-maujood item (aana chahiye `Item nahi mila`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu/9999 -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"pricePaise":9000}' } catch { $_.ErrorDetails.Message }
```
Customer menu nahi chala sakta (aana chahiye `Aapko ye karne ki ijazat nahi hai`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Headers @{ Authorization = "Bearer $access2" } } catch { $_.ErrorDetails.Message }
```
Item hatao:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu/1 -Method Delete -Headers @{ Authorization = "Bearer $access" }
```
Aana chahiye: `Item hata diya`.

### J. Server bina error ke chalna
Server terminal me `Server 5000 par chalu` dikhe aur koi laal error na aaye. `.env` me `JWT_SECRET` chhota (`abc`) karke `npm run dev` chalao to server `.env me galti` likh kar band hona chahiye. Dekh kar `.env` wapas theek kar do.

### K. Public routes (Step 5.1, bina token ke)

Pehle taiyari: provider `8888888888` ka `status` `APPROVED` aur `isOpen` true ho (section H), aur aaj ke din ka ek item ho (section I).

Shehar se list (`Prayagraj` wahi shehar jo profile me hai). `items` me provider aana chahiye:
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers?city=Prayagraj"
```
Chhote akshar me shehar (wahi result):
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers?city=prayagraj"
```
Private cheezein nahi dikhni chahiye, sirf `id`, `shopName`, `city`, `pincode`:
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers?city=Prayagraj" | ConvertTo-Json -Depth 5
```
Dusra shehar (`items` khali, `total` 0):
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers?city=Delhi"
```
Bina shehar ke (aana chahiye `Shehar likho`):
```
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers" } catch { $_.ErrorDetails.Message }
```
Bahut chhota shehar (ye bhi `Shehar likho`):
```
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers?city=a" } catch { $_.ErrorDetails.Message }
```
Aaj ka menu (`1` ki jagah provider ka `id`). Sirf aaj ke din wale aur har din wale items aane chahiye, dusre din ke ya `isAvailable: false` wale nahi:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/1/menu | ConvertTo-Json -Depth 5
```
Galat id (aana chahiye `Galat provider id`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/abc/menu } catch { $_.ErrorDetails.Message }
```
Na-maujood provider (aana chahiye `Ye dukaan abhi band hai ya mili nahi`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/9999/menu } catch { $_.ErrorDetails.Message }
```
Dukaan band karke dekho: pehle band karo (section H ki `{"isOpen":false}` wali command), phir list khali aani chahiye aur menu me `Ye dukaan abhi band hai ya mili nahi`:
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/1/menu } catch { $_.ErrorDetails.Message }
```
Phir wapas kholo:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/open -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"isOpen":true}'
```

### L. Website (Step 5.2), browser me

Teen cheezein chalni chahiye: backend (`backend` folder me `npm run dev`), website (`web` folder me `npm run dev`, address `http://localhost:3000`), aur database.

1. `http://localhost:3000` kholo, `Prayagraj` likh kar **Dhundo** dabao: `Sharma Ghar Ka Tiffin` ka card aana chahiye (`prayagraj` chhote akshar me bhi).
2. `Delhi` likho: `Delhi me abhi koi khuli dukaan nahi mili`.
3. Card par click karo: `Aaj ka menu (din ka naam)` aur aaj ke din wale items, daam rupaye me (`₹95`). Dusre din ke items nahi.
4. `Prayagraj ki dukaanein` link: list wapas aani chahiye.
5. `http://localhost:3000/provider/9999` aur `/provider/abc`: `Ye dukaan abhi band hai ya mili nahi`.
6. Menu me item na dikhe to aksar uska `dayOfWeek` aaj ka nahi hota. Item ka din badalna ho to (item `id` `3`, aaj Thursday = `4`):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu/3 -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"dayOfWeek":4}'
```

### M. Website folder ki saaf-safai (agar problems dikhe)

`web` folder me (har command alag line par):
```
dir src
```
```
Get-Content next.config.ts
```
```
Get-Content .env.local
```
`.next` cache hatani ho to (server band karke):
```
Remove-Item -Recurse -Force .next
```
Phir `npm run dev`, aur VS Code me `Ctrl + Shift + P` se `TypeScript: Restart TS Server`. `.next` hatane ke baad VS Code kuch second problems dikha sakta hai, server chalte hi `.next` dobara ban jata hai aur wo hat jati hain.

### N. Git (har step ke baad)
```
git status --short
```
`.env`, `.env.local`, `node_modules`, `.next` nahi dikhna chahiye. Phir:
```
git add .
```
```
git commit -m "Step ka naam"
```
```
git push
```
`tiffin-ghar` folder se karo (andar `backend` ya `web` se `git add .` karne par sirf wahi folder jata hai). Secrets check:
```
git ls-files | findstr env
```
`backend/.env` ya `web/.env.local` nahi dikhna chahiye.


## 9. Jo galtiyan hui aur unke hal (Step 5.3 se 6.5)

Purani galtiyan `tiffin-ghar-project-notes-step5.md` ke section 8 me hain.

- **Login ke do alag version ban gaye:** mere diye `session.ts` (`saveTokens`, `getUserOrRefresh`, cookie `access_token`) aur tumhare chat wale `session.ts` (`setSession`, `getCurrentUser`, cookie `tg_access`) ke naam alag the. Dono mila dene se import ke naam nahi milte aur laal errors aate. **Ek hi version rakho: tumhara wala (`tg_access`, `setSession`).** Naye files (`authed.ts` wagairah) usi ke hisaab se likhe hain.
- **`API_URL` export hona chahiye** `api.ts` se, kyunki `session.ts` use import karti hai.
- **Prisma 7 me `migrate dev` ke baad client apne aap generate nahi hota.** Laal error: `Property 'order' does not exist on type 'PrismaClient<never, ...>'`. Fix: server band karo, `npx prisma generate`, VS Code me `Ctrl + Shift + P`, `TypeScript: Restart TS Server`, phir `npm run dev`.
- **`$oid` khali tha to `Ye route nahi mila`:** URL `.../orders//status` ban gaya. Naya terminal ya fail hui order command ki wajah se hota hai. Hal: `$oid` print karke dekho, khali ho to 7.2 A ki `$body`, `$o`, `$oid` commands dobara chalao.
- **`$m.items` me sirf aaj ke din ke items aate hain:** `Aaj Ka Special` jaise item ka `dayOfWeek` aaj ka na ho to wo nahi dikhega aur uska order bhi nahi hoga. Ye galti nahi, sahi kaam hai. Har din wale items (`dayOfWeek` khali) hamesha aate hain.
- **`CANCELLED` order par status nahi badalta:** status test ke liye hamesha naya `PLACED` order banao.
- **Customer ke liye `$refresh2` alag rakho,** taaki customer ka bhi refresh ho sake.
- **DevTools me `Application` tab na dikhe:** tabs ki line ke `>>` me hota hai. Cookies table purani dikhe to table ke upar ka refresh icon dabao. DevTools usi tab ke cookies dikhata hai jis par khula ho.
- **`ajs_anonymous_id` cookie:** kisi extension ki hai, hamari nahi.
- **VS Code me `globals.css` par `Unknown at rule @theme` warning:** ye Tailwind v4 ka normal syntax hai, VS Code ka CSS checker use nahi pehchanta. Website par koi asar nahi, ignore karo. Hatana ho to VS Code `settings.json` me `"css.lint.unknownAtRules": "ignore"` jodo.

## 10. Agla: Step 6.6 (Batch B), provider dashboard (website)

Ab provider ka kaam PowerShell se hota hai. Asli provider ke liye website par dashboard chahiye. Ek saath banana hai (backend ke routes pehle se bane hain, koi naya backend route zaroori nahi):

1. **Login ke baad role se sahi page:** `PROVIDER` ko `/dashboard`, `CUSTOMER` ko home. Login page ka `next` raasta pehle se maana jata hai.
2. **Dashboard home (`/dashboard`):** dukaan ki profile ka status (`PENDING` ya `APPROVED`), dukaan khula/band karne ka switch (sirf `APPROVED` par, warna `Profile abhi approve nahi hui hai`).
3. **Profile banana:** customer ke liye form (`POST /providers`: `shopName`, `city`, `address`, `pincode` aur baaki jo fields `tiffin-ghar-project-notes-step4.md` me hain). **Dhyan:** profile banate hi role `PROVIDER` ho jata hai par purane token me role `CUSTOMER` hota hai. Profile banane ke turant baad `/auth/refresh` karwana zaroori hai (server action me), tab naya token `PROVIDER` role wala milta hai.
4. **Menu sambhalna:** items ki list, naya item jodna, badalna, hatana, `isAvailable` toggle. Daam rupaye me likhwana aur paise me bhejna (`₹85` se `8500`). `dayOfWeek` ke liye "har din" ya koi ek din chunne ka dropdown.
5. **Orders:** `GET /providers/me/orders` ki list (status se chhaantna), har order me customer ka phone, pata, items, total, aur status ke hisaab se sahi buttons (accept, reject, ban raha hai, raaste me, pahunch gaya) jo `PATCH .../status` bulate hain. Server wali `ALLOWED_FROM` ke rules website par bhi wahi dikhao.
6. **Approval abhi Prisma Studio se hota hai** (admin panel Step 9 me). Naye provider ko dashboard par `Approval ka intezaar` likha dikhao.

Test ke liye naya provider banana ho to koi alag number (jaise `7777777777`) se login karo, dashboard par profile banao, Prisma Studio me `Provider` table me `status` `APPROVED` karo, phir dukaan kholo.

## 11. Test accounts aur bachi hui cheezein

- `9999999999`: customer (testing).
- `8888888888`: provider ("Sharma Ghar Ka Tiffin", Prayagraj, pincode 211001, provider `id` 1, `APPROVED`, menu me kuch items, jinme `Roti Sabzi` (`id` 2, ₹60, har din) aur `Aaj Ka Special` (`id` 3) hain).
- Website par apna asli number bhi chalta hai. OTP abhi SMS se nahi, backend wale terminal me print hota hai.

### Kitna bacha hai

| Step | Kaam |
|---|---|
| **6.6** | Provider dashboard (upar section 10). **Agla.** |
| Design step | Saare pages ban jane ke baad ek alag step: rang, hero banner, logo, font, mobile par achha dikhna, dukaan aur dish ki photos (iske liye pehle photo upload + storage + database field). Pasand ki 2-3 websites ka dhyan rakho. |
| 7 | Mobile app (React Native), website jaisa brand. Backend wahi rahega. |
| 8 | Subscription (monthly meals), wallet, payment (online payment, Razorpay). |
| 9 | Tracking (order page live badalna), rating, admin panel (provider approve/reject, abhi Prisma Studio se). |

### Zaroori baatein

- `npm audit fix --force` mat chalana.
- `.env`, `.env.local`, database password, `JWT_SECRET`, access aur refresh token kisi ko mat bhejo, chat ya screenshot me bhi nahi.
- Hamesha `tiffin-ghar` folder se commit karo, `backend` ya `web` ke andar se nahi.
- Naya Prisma model ya migration ke baad `npx prisma generate` aur `TypeScript: Restart TS Server`.
- Purane expire hue refresh tokens table me jama hote rahenge. Background job (BullMQ) aane par saaf karenge.
- Rate limit abhi memory me hai (server restart par reset). Live par Redis.
- **Live se pehle:** website ke server se saare customers ke requests **ek hi IP** se aayenge, to backend ka IP-wala rate limit sabko mila kar gin lega. Backend me asli customer ka IP pass karwana padega (`trust proxy` aur `X-Forwarded-For`).
- Live se pehle `cors()` me sirf apni website ka address.
- Asli SMS (DLT registration ke saath) launch se pehle jodni hai.
- Nearby dukaanein (PostGIS, latitude/longitude) baad me. Abhi shehar aur pincode.
- Wallet aur payment ke liye RBI/Razorpay ka review kisi expert se karwana. Providers ko FSSAI chahiye.
- Hosting, domain, database backup, FSSAI check: launch se pehle.
- Order ka status page apne aap live nahi badalta (`F5` karna padta hai), live tracking baad me.
- Har naye kaam se pehle `git commit`.

## 12. Files jinka code is notes me nahi hai

Step 5.3 ki kuch files tumne alag chat me banayi thi, unka code yahan nahi hai: `web/src/app/login/page.tsx`, `web/src/app/login/actions.ts` (ya jo bhi login ka server code hai), `web/src/app/session/refresh/route.ts`, aur home page `web/src/app/page.tsx` (upar Login/Logout dikhane wala). Naye chat ko inki zaroorat padegi to ye commands se print karke paste karo (`tiffin-ghar` folder se, har command alag line par):

```
Get-ChildItem -Recurse -Name web\src\app
```
```
Get-Content web\src\app\login\page.tsx
```
```
Get-Content web\src\app\session\refresh\route.ts
```
```
Get-Content web\src\app\page.tsx
```

## 13. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, Next.js website, baad me React Native mobile app). Is app ka startup bhi karna hai, to ise professional banana hai. Paanch notes files attach ki hain (`tiffin-ghar-project-notes-step3.md`, `tiffin-ghar-project-notes-step3-5-1.md`, `tiffin-ghar-project-notes-step4.md`, `tiffin-ghar-project-notes-step5.md` aur `tiffin-ghar-project-notes-step6.md`). Step 1 se 6.5 poore ho gaye (phone OTP login, JWT, refresh token, provider profile aur menu, public routes, website par customer login, order banana, mere orders, cancel, provider ke orders ka status, customer ke website pages). Ab Step 6.6 se shuru karna hai: provider ka dashboard website par (role se sahi page par bhejna, dukaan ki profile banana, menu sambhalna, dukaan khola/band, orders dekhna aur status badalna). Notes ke section 10 me tay hua tareeka hai. Mujhe jo bhi kaam kai steps me ek saath ho sakta hai wo ek saath (batch me) do, taaki bar-bar wahi code na badalna pade, par tabhi jab usse kuch toote nahi. Hinglish me step by step samjhao, aur har file kis folder me banani hai ye saaf batao. Ek-ek command alag line me do. Jahan files banane ke baad kuch test karna ho, saari commands aur browser ke steps likh kar do. Notes files me hamesha saari commands (login aur har test command) rakhna.
