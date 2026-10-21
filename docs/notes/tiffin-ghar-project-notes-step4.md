# Tiffin Ghar: Notes (Step 3.5.2 refresh token aur Step 4 provider profile + menu, poora code)

Ye file in do files ke **saath** use karni hai: `tiffin-ghar-project-notes-step3.md` (Step 1, 2, 3, 3.5.1 ka code) aur `tiffin-ghar-project-notes-step3-5-1.md` (3.5.1 ke test, galtiyan, Claude Code ki discussion). Is file me wo sab hai jo uske baad hua: refresh token, provider profile aur menu ka final code. **Naye chat me teeno files attach karo. Naye chat se Step 5 (customers ke liye public routes aur website) shuru hoga.**

## 1. Abhi kahan hain

- Step 1, 2, 3 (OTP login, JWT, `/me`): ho gaye aur push hue.
- Step 3.5.1 (env check, zod, helmet, rate limit, `/api/v1`): ho gaya, test pass, push hua.
- Step 3.5.2 (refresh token, rotation, logout): ho gaya, test pass, push hua. Commit: "Step 3.5.2: refresh token with rotation and logout".
- Step 4.1 (provider profile, approval status, khula/band): ho gaya, test pass, push hua.
- Step 4.2 (menu items, daam paise me): ho gaya, test pass, push hua.
- **Agla: Step 5** (customers ke liye public routes: approved aur khule providers ki list, unka aaj ka menu, phir Next.js website).

## 2. Final structure (backend)

`*` = Step 3.5.2 ya 4 me naya, `~` = in steps me badla.

```
backend/
  app.ts                    ~ providers aur menu ke routes jude
  index.ts
  config/env.ts
  lib/
    prisma.ts
    tokens.ts               * naya (3.5.2)
  middleware/
    auth.ts
    validate.ts
    rateLimit.ts            ~ refreshLimiter juda
  routes/
    auth.ts                 ~ verify-otp badla, /refresh aur /logout jude
    providers.ts            * naya (4.1)
    menu.ts                 * naya (4.2)
  validators/
    auth.ts                 ~ refreshSchema juda
    provider.ts             * naya (4.1)
    menu.ts                 * naya (4.2)
  prisma/
    schema.prisma           ~ RefreshToken, Provider, MenuItem jude
    migrations/             add_refresh_token, add_provider, add_menu_item
```

## 3. Faisle jo tay hue

### Refresh token (3.5.2)
- Access token **15 minute**, refresh token **30 din**.
- **Rotation:** har `/refresh` par naya refresh token milta hai aur purana band ho jata hai.
- **Reuse detection:** band hua token dobara aaye to uski poori family band (chor aur asli user dono logout, dobara OTP se login).
- Refresh token database me **SHA-256 hash** se, asli token kabhi nahi. Refresh token 96 character ka random hex hai.
- `verify-otp` ka response ab `{ accessToken, refreshToken, user }` hai (pehle `token` tha).
- Logout hamesha "Logout ho gaya" bolta hai, token galat ho tab bhi.

### Provider (4.1)
- Ek user ka ek hi provider profile.
- Profile `PENDING` se shuru hoti hai. Jab tak admin `APPROVED` na kare, dukaan khul nahi sakti aur customers ko nahi dikhni chahiye. Admin panel Step 9 me banega, tab tak Prisma Studio (`npx prisma studio`) se `status` badalte hain.
- Profile banate hi user ka role `CUSTOMER` se `PROVIDER` ho jata hai (ADMIN ka role nahi chhedte).
- Role badalne par purane access token me role purana rehta hai. Naya role token me tab aata hai jab `/auth/refresh` chale.
- Provider `PATCH /me` se `status` ya `isOpen` nahi badal sakta (validator me ye fields hain hi nahi), isliye khud ko approve nahi kar sakta.

### Menu (4.2)
- Daam **paise me, integer** (₹85 = `8500`). Minimum ₹1, maximum ₹10,000.
- `dayOfWeek`: 0 = Sunday ... 6 = Saturday, `null` matlab har din.
- Approve hone se pehle bhi menu bana sakte hain.
- Har route me `providerId` match karwate hain, taaki dusre provider ka item na dikhe na badle.
- `isAvailable` se item hataye bina aaj ke liye band kar sakte hain.
- Step 6 me order me dish ka naam aur daam **copy** karke rakhenge, taaki item hatane par purane orders ka hisaab na bigde.

## 4. prisma/schema.prisma (abhi ka poora)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  CUSTOMER
  PROVIDER
  ADMIN
}

enum ProviderStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id            Int            @id @default(autoincrement())
  phone         String         @unique
  name          String?
  role          Role           @default(CUSTOMER)
  createdAt     DateTime       @default(now())
  refreshTokens RefreshToken[]
  provider      Provider?
}

model Otp {
  id        Int      @id @default(autoincrement())
  phone     String
  codeHash  String
  expiresAt DateTime
  attempts  Int      @default(0)
  createdAt DateTime @default(now())

  @@index([phone])
}

model RefreshToken {
  id        Int       @id @default(autoincrement())
  userId    Int
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  familyId  String
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([familyId])
}

model Provider {
  id          Int            @id @default(autoincrement())
  userId      Int            @unique
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  shopName    String
  city        String
  address     String
  pincode     String
  fssaiNumber String?
  status      ProviderStatus @default(PENDING)
  isOpen      Boolean        @default(false)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  menuItems   MenuItem[]

  @@index([city])
}

model MenuItem {
  id          Int      @id @default(autoincrement())
  providerId  Int
  provider    Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  name        String
  description String?
  pricePaise  Int
  dayOfWeek   Int?
  isVeg       Boolean  @default(true)
  isAvailable Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([providerId])
}
```

Niyam yaad rakhna: schema badlo, phir `npx prisma migrate dev --name naam`, phir `npx prisma generate`.

## 5. Code

### lib/tokens.ts

```ts
import { createHash, randomBytes, randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import { env } from "../config/env.js";

const ACCESS_TTL = "15m";
const REFRESH_DAYS = 30;

// Refresh token lamba random string hai, isliye tez SHA-256 kaafi hai
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(user: { id: number; role: string }) {
  return jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: ACCESS_TTL,
  });
}

export async function issueRefreshToken(userId: number, familyId: string = randomUUID()) {
  const token = randomBytes(48).toString("hex"); // 96 character
  await prisma.refreshToken.create({
    data: {
      userId,
      familyId,
      tokenHash: hashToken(token), // database me sirf hash, asli token nahi
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}
```

### validators/auth.ts (poora)

```ts
import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Sahi 10 digit ka mobile number daalo");

export const sendOtpSchema = z.object({ phone });

export const verifyOtpSchema = z.object({
  phone,
  code: z.string().trim().regex(/^\d{6}$/, "6 digit ka OTP daalo"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().trim().regex(/^[a-f0-9]{96}$/, "Refresh token galat hai"),
});
```

### middleware/rateLimit.ts (poora)

```ts
import { rateLimit } from "express-rate-limit";

const make = (windowMs: number, limit: number, error: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error },
  });

export const globalLimiter = make(60_000, 120, "Bahut zyada requests, thoda ruko");
export const sendOtpLimiter = make(15 * 60_000, 10, "Bahut zyada OTP requests, 15 minute baad try karo");
export const verifyOtpLimiter = make(15 * 60_000, 20, "Bahut zyada koshish, 15 minute baad try karo");
export const refreshLimiter = make(15 * 60_000, 30, "Bahut zyada koshish, 15 minute baad try karo");
```

### routes/auth.ts (poora)

```ts
import { Router } from "express";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { validate } from "../middleware/validate.js";
import { sendOtpLimiter, verifyOtpLimiter, refreshLimiter } from "../middleware/rateLimit.js";
import { sendOtpSchema, verifyOtpSchema, refreshSchema } from "../validators/auth.js";
import { hashToken, signAccessToken, issueRefreshToken } from "../lib/tokens.js";

const router = Router();

function hashOtp(phone: string, code: string) {
  return createHmac("sha256", env.JWT_SECRET).update(`${phone}:${code}`).digest("hex");
}

router.post("/send-otp", sendOtpLimiter, validate(sendOtpSchema), async (req, res, next) => {
  try {
    const { phone } = req.body;

    const last = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });
    if (last && Date.now() - last.createdAt.getTime() < 60_000) {
      return res.status(429).json({ error: "Thoda ruko, 1 minute baad dobara try karo" });
    }

    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.deleteMany({ where: { phone } });
    await prisma.otp.create({
      data: { phone, codeHash: hashOtp(phone, code), expiresAt },
    });

    // Asli SMS baad me. Production me OTP kabhi print nahi hoga.
    if (env.NODE_ENV !== "production") {
      console.log(`OTP for ${phone}: ${code}`);
    }

    res.json({ message: "OTP bhej diya gaya" });
  } catch (e) {
    next(e);
  }
});

router.post("/verify-otp", verifyOtpLimiter, validate(verifyOtpSchema), async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    const otp = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) return res.status(400).json({ error: "Pehle OTP maango" });
    if (otp.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP expire ho gaya, naya maango" });
    }
    if (otp.attempts >= 5) {
      return res.status(429).json({ error: "Bahut galat koshish, naya OTP maango" });
    }

    const given = Buffer.from(hashOtp(phone, code));
    const saved = Buffer.from(otp.codeHash);
    const ok = given.length === saved.length && timingSafeEqual(given, saved);

    if (!ok) {
      await prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ error: "OTP galat hai" });
    }

    await prisma.otp.deleteMany({ where: { phone } });

    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user.id);

    res.json({ accessToken, refreshToken, user });
  } catch (e) {
    next(e);
  }
});

router.post("/refresh", refreshLimiter, validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const saved = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: true },
    });

    if (!saved || saved.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: "Session khatam ho gaya, dobara login karo" });
    }

    // Band hua token dobara aaya: chori ka shak, poori family band
    if (saved.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { familyId: saved.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return res.status(401).json({ error: "Session khatam ho gaya, dobara login karo" });
    }

    // Purana token band karo. count 0 matlab kisi aur request ne abhi use band kar diya
    const closed = await prisma.refreshToken.updateMany({
      where: { id: saved.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (closed.count === 0) {
      return res.status(401).json({ error: "Session khatam ho gaya, dobara login karo" });
    }

    const newRefresh = await issueRefreshToken(saved.userId, saved.familyId);
    res.json({ accessToken: signAccessToken(saved.user), refreshToken: newRefresh });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", refreshLimiter, validate(refreshSchema), async (req, res, next) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(req.body.refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    res.json({ message: "Logout ho gaya" });
  } catch (e) {
    next(e);
  }
});

export default router;
```

### validators/provider.ts

```ts
import { z } from "zod";

export const createProviderSchema = z.object({
  shopName: z.string().trim().min(2, "Dukaan ka naam likho").max(80),
  city: z.string().trim().min(2, "Shehar likho").max(60),
  address: z.string().trim().min(5, "Poora pata likho").max(200),
  pincode: z.string().trim().regex(/^\d{6}$/, "6 digit ka pincode daalo"),
  fssaiNumber: z
    .string()
    .trim()
    .regex(/^\d{14}$/, "FSSAI number 14 digit ka hota hai")
    .optional(),
});

export const updateProviderSchema = createProviderSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Kuch to badalne ke liye bhejo");

export const openSchema = z.object({ isOpen: z.boolean() });
```

### routes/providers.ts

```ts
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
```

### validators/menu.ts

```ts
import { z } from "zod";

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(2, "Dish ka naam likho").max(80),
  description: z.string().trim().max(300).optional(),
  pricePaise: z
    .number("Daam number me daalo")
    .int("Daam paise me, poora number daalo (₹85 = 8500)")
    .min(100, "Daam kam se kam ₹1 ho")
    .max(1_000_000, "Daam ₹10,000 se zyada nahi ho sakta"),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});

export const updateMenuItemSchema = createMenuItemSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Kuch to badalne ke liye bhejo");
```

### routes/menu.ts

```ts
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
```

### app.ts (poora, abhi ka)

Dhyan: `/providers/me/menu` wali line `/providers` se **pehle** honi chahiye.

```ts
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./lib/prisma.js";
import authRouter from "./routes/auth.js";
import providersRouter from "./routes/providers.js";
import menuRouter from "./routes/menu.js";
import { requireAuth, type AuthedRequest } from "./middleware/auth.js";
import { globalLimiter } from "./middleware/rateLimit.js";

export const app = express();

app.use(helmet());
app.use(cors()); // live karne se pehle yaha sirf apni website ka address denge
app.use(express.json({ limit: "100kb" }));
app.use(globalLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Tiffin Ghar API chal rahi hai" });
});

const api = express.Router();

api.use("/auth", authRouter);
api.use("/providers/me/menu", menuRouter);
api.use("/providers", providersRouter);

api.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user) return res.status(404).json({ error: "User nahi mila" });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

app.use("/api/v1", api);

app.use((req, res) => {
  res.status(404).json({ error: "Ye route nahi mila" });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if ((err as { type?: string })?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON galat likha hai" });
  }
  console.error(err);
  res.status(500).json({ error: "Kuch gadbad hui, baad me try karo" });
});
```

`config/env.ts`, `middleware/auth.ts`, `middleware/validate.ts`, `index.ts` me koi badlav nahi hua (step3 file me jaise hain waise).

## 6. Saare API routes (abhi tak)

| Route | Kaun | Kaam |
|---|---|---|
| `POST /api/v1/auth/send-otp` | sab | OTP maango |
| `POST /api/v1/auth/verify-otp` | sab | `accessToken`, `refreshToken`, `user` |
| `POST /api/v1/auth/refresh` | sab | naya access + naya refresh token |
| `POST /api/v1/auth/logout` | sab | refresh token band |
| `GET /api/v1/me` | login | apna user |
| `POST /api/v1/providers` | login | provider profile banao (role `PROVIDER` ho jata hai) |
| `GET /api/v1/providers/me` | provider | meri profile |
| `PATCH /api/v1/providers/me` | provider | profile badlo |
| `PATCH /api/v1/providers/me/open` | provider | dukaan khula/band (sirf `APPROVED` par) |
| `GET /api/v1/providers/me/menu` | provider | meri menu |
| `POST /api/v1/providers/me/menu` | provider | naya item |
| `PATCH /api/v1/providers/me/menu/:id` | provider | item badlo |
| `DELETE /api/v1/providers/me/menu/:id` | provider | item hatao |

## 6A. Saare test commands (PowerShell)

Server ek terminal me `npm run dev` se chalta rahe, ye commands dusre terminal me. **Har command alag line par chalao, har ke baad Enter.** Variable banane wali commands (`$r = ...`, `$access = ...`) kuch print nahi karti, ye theek hai. Token ko print ya chat me paste mat karo.

Prompt me `...\backend>` hona chahiye.

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
Check ki dono bhare hain (`$refresh` ki lambai 96 honi chahiye):
```
$access.Length, $refresh.Length
```

**Customer ke liye alag login** (provider route par 403 test karne ke liye), number `9999999999`:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999"}'
```
```
$r2 = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999","code":"ASLI_OTP"}'
```
```
$access2 = $r2.accessToken
```

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
Aana chahiye: `Logout ho gaya`. Phir wahi token se refresh karo (section F ki pehli refresh command), `Session khatam ho gaya` aana chahiye.

### H. Provider profile (login `8888888888` se)

Profile banao (`status: PENDING` aana chahiye):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"shopName":"Sharma Tiffin","city":"Prayagraj","address":"Civil Lines, Prayagraj","pincode":"211001"}'
```
Refresh karne se pehle `/me` (aana chahiye `Aapko ye karne ki ijazat nahi hai`, kyunki token me role purana hai):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me -Headers @{ Authorization = "Bearer $access" } } catch { $_.ErrorDetails.Message }
```
Refresh karke (section F ki commands) naya `$access` lo, phir:
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
Approve karne ke liye alag terminal me `backend` folder me `npx prisma studio` chalao, `Provider` table me `status` ko `APPROVED` karke Save karo. Phir wahi `open` command dobara chalao, `isOpen: True` aana chahiye. Band karne ke liye `{"isOpen":false}`.

### I. Menu (provider `8888888888`)

Item banao (daam paise me, ₹85 = 8500):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"name":"Dal Chawal Tiffin","description":"Dal, chawal, sabzi, 2 roti","pricePaise":8500,"dayOfWeek":1}'
```
Har din wala item (`dayOfWeek` ke bina):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"name":"Roti Sabzi","pricePaise":6000}'
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

### K. Git (har step ke baad)
```
git status --short
```
`.env`, `node_modules` ya `tiffin-ghar` ke seedha andar ka `package.json` nahi dikhna chahiye. Phir:
```
git add .
```
```
git commit -m "Step ka naam"
```
```
git push
```

## 7. Jo galtiyan hui aur unke hal

- **PowerShell me kai commands ek line me jud gayi:** `$r = ...`, `$access = ...`, `$refresh = ...` teen alag commands hain. Har ek **alag line par** chalao, har ke baad Enter. Ek line me judne par error aata hai: `A positional parameter cannot be found that accepts argument ...`. Multi-line paste me PowerShell kabhi-kabhi lines jod deta hai, isliye variable banane wali commands ek-ek karke chalao.
- **`-ContentType` ki spelling:** `"application/json"` sahi hai. Ek baar `applition` likha gaya tha.
- **Access token 15 minute me expire hota hai:** `Token galat ya expire hai` aaye to `/auth/refresh` se naya lo, ya dobara login karo. Refresh ke baad naya `$refresh` bhi save karna padta hai, kyunki purana band ho jata hai.
- **`$access2` customer ke liye:** provider route par customer ka token alag variable me rakhte hain (`9999999999` se login karke) taaki 403 test ho sake.
- **`LF will be replaced by CRLF` warning** git push par: Windows par normal hai, koi dikkat nahi.
- **Token screenshot me mat dikhao:** error me token dikh jaye to bhi ye test number ka hota hai, par aadat banao ki screenshot me token ya `.env` na dikhe.

## 8. Test numbers jo bane hain (sirf testing ke liye)

- `9999999999`: customer (login test).
- `8888888888`: provider (profile "Sharma Ghar Ka Tiffin" ya jo naam diya, status Prisma Studio se `APPROVED` kiya, menu me kuch items).

Ye asli numbers nahi hain, SMS abhi nahi jata. OTP server ke terminal me print hota hai.

## 9. Agla: Step 5

### 5.1 Backend: customers ke liye public routes (bina login)

Provider ki apni routes (`/providers/me/...`) alag hain. Customers ke liye naye routes chahiye:

- `GET /api/v1/providers?city=...` : sirf `APPROVED` aur `isOpen` providers ki list. Abhi shehar ya pincode se, "nearby" (PostGIS, latitude/longitude) baad me.
- `GET /api/v1/providers/:id/menu` : us provider ka **aaj ka** menu (aaj ka `dayOfWeek` wala ya har din wala, aur `isAvailable: true`).
- Dhyan: `/providers/:id` wala route `/providers/me` ke **baad** define hona chahiye, nahi to "me" ko id samajh lega.
- Public response me phone, FSSAI ya provider ki private cheezein nahi jayengi, sirf wahi jo customer ko dikhana hai.
- Rate limit aur `zod` se query check.

### 5.2 Website (Next.js)

- Next.js project `tiffin-ghar/web` folder me (backend ke saath, alag folder).
- Pehle page: shehar chuno, providers ki list, provider par click karke aaj ka menu.
- Backend ko website se call karne ke liye `cors()` me website ka address dena padega (abhi sabko ijazat hai, live se pehle badalna hai).
- Customer login ka page (OTP) uske baad.
- Website par refresh token cookie me (httpOnly) rakhne ka tareeka tay karna hai. Mobile app me `expo-secure-store` use hoga.

### Uske baad
Step 6 ek baar ka order, Step 7 mobile app, Step 8 subscription, wallet, payment, Step 9 tracking, rating, admin panel (provider approve/reject yahin se hoga).

## 10. Zaroori baatein (pehle jaisi)

- `npm audit fix --force` mat chalana.
- `.env`, database password, `JWT_SECRET`, access aur refresh token kisi ko mat bhejo, chat ya screenshot me bhi nahi.
- Purane expire hue refresh tokens table me jama hote rahenge. Background job (BullMQ) aane par saaf karenge.
- Rate limit abhi memory me hai (server restart par reset). Live par Redis.
- OTP abhi terminal me print hota hai. Asli SMS (DLT registration ke saath) launch se pehle jodni hai.
- Wallet aur payment ke liye RBI/Razorpay ka review kisi expert se karwana. Providers ko FSSAI chahiye.
- Har naye kaam se pehle `git commit`.

## 11. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, baad me Next.js website aur React Native mobile app). Is app ka startup bhi karna hai, to ise professional banana hai. Teen notes files attach ki hain (`tiffin-ghar-project-notes-step3.md`, `tiffin-ghar-project-notes-step3-5-1.md` aur `tiffin-ghar-project-notes-step4.md`). Step 1 se 4 poore ho gaye aur GitHub par push hue: phone OTP login, JWT, refresh token (rotation), provider profile aur menu (daam paise me). Ab Step 5 se shuru karna hai: pehle customers ke liye public routes (approved aur khule providers ki list, aaj ka menu), phir Next.js website. Hinglish me step by step samjhao, aur har file kis folder me banani hai ye saaf batao. Ek-ek command alag line me do.
