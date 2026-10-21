# Tiffin Ghar: Project Notes (Step 1, 2, 3 aur Step 3.5.1 tak)

Ye file pichli notes file (`step2`) ke aage ki hai, lekin isme zaroori purani cheezein bhi daal di hain, taki ye akeli kaafi ho. **Agla kaam: Step 3.5.1 ka test aur commit (agar baki ho), phir Step 3.5.2 (refresh token), phir Step 4. Ye naye chat se shuru hoga.**

## 1. App kya hai (chhota yaad)

Pure India (chhote aur bade shehron, districts) ke liye tiffin service app, mobile aur website dono par.
- **Customer:** nearby providers aur unka aaj ka meal dekhe, ek baar ka / roz ka / mahine ka (26 din, 5% bachat) order kare, payment wallet, UPI/card ya COD se, subscription pause/band kare, order tracking dekhe.
- **Provider:** profile aur FSSAI, roz ka menu aur daam, dukaan khula/band, orders ka status badalna, kamai.
- **Admin:** naye providers approve/reject, complaints, stats.
- Ek clickable HTML prototype pehle bana kar dikhaya ja chuka hai.
- **Is app ka startup bhi karna hai.** User chahta hai ki app professional aur asli startup level ka bane, chahe uske liye paisa kharch karna pade.

## 2. Final tech stack

| Hissa | Technology |
|---|---|
| Website | Next.js (React) |
| Mobile app | React Native (Expo) |
| Backend | Node.js + Express, TypeScript (`tsx` se chalta hai) |
| Database | PostgreSQL 18 + Prisma **7.10.0** |
| Login | Phone OTP (SMS service baad me) + JWT |
| Payment | Razorpay |
| Validation, security | `zod`, `helmet`, `express-rate-limit` |

## 3. Kaam ka order

1. Setup: Node.js, backend skeleton (**ho gaya**)
2. Database, Prisma, User table, users API (**ho gaya**)
3. Login: phone OTP + JWT, `/me` route (**ho gaya aur GitHub par push hua**)
3.5. Hardening (pakka karna, professional banane ke liye):
   - 3.5.1: env check, zod validation, helmet, rate limit, `/api/v1`, saaf folder structure, ek jagah error handling (**code de diya gaya hai, test aur commit user ko karna hai**)
   - 3.5.2: refresh token (**agla**)
4. Provider profile aur menu
5. Website: nearby providers ki list
6. Ek baar ka order
7. Mobile app (React Native), wahi API use karke
8. Subscription, wallet aur payment
9. Tracking, rating, admin panel

## 4. Step 1 aur Step 2 ka saar

- Node.js `v26.11.1`, VS Code, Android Studio installed.
- PostgreSQL 18 aur pgAdmin 4 installed. Database ka naam `tiffin_ghar`. (pgAdmin me do server entries dikhti hain, dono ek hi `localhost:5432` ko dikhati hain, isse koi dikkat nahi.)
- Folder: `tiffin-ghar/backend`. GitHub par private repo `tiffin-ghar`.
- Prisma ko **7.10.0** par pin kiya (pehle `8.0.0-rc.22` aa gaya tha, wo test version tha).
- Backend ES modules + TypeScript me hai (`"type": "module"`). Chalane ke liye: `npm run dev` (script: `tsx watch index.ts`, server port 5000 par).
- Imports me file ke naam ke aage `.js` likhte hain (jaise `"./lib/prisma.js"`), chahe file `.ts` ho. Ye ES modules ka niyam hai.

### prisma.config.ts

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### lib/prisma.ts

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

### .env (sirf naam, asli value yahan nahi)

```
DATABASE_URL="postgresql://postgres:APKA_PASSWORD@localhost:5432/tiffin_ghar?schema=public"
JWT_SECRET="64_character_ka_random_text"
```
Password me `@` ho to `%40`, `#` ho to `%23` likhna.

### .gitignore (har line left se shuru, koi space aage nahi)

```
node_modules
.env
/generated/prisma
.claude
.windsurf
.agents
skills-lock.json
```

## 5. Step 3: Login (OTP + JWT)

### Step 3.1: taiyari

1. `prisma/schema.prisma` me `Otp` model joda.
2. `npx prisma migrate dev --name add_otp`, phir `npx prisma generate`.
3. `npm install jsonwebtoken` aur `npm install --save-dev @types/jsonwebtoken`.
4. `JWT_SECRET` banaya. Command **ek hi line me** chalani hai (do line me toot jaye to terminal `>>` par ruk jata hai, tab `Ctrl + C` dabao):
   ```
   node --input-type=module -e "import { randomBytes } from 'crypto'; console.log(randomBytes(32).toString('hex'))"
   ```
   Output (64 character) `.env` me `JWT_SECRET="..."` me daala.

### prisma/schema.prisma (abhi ka poora)

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

model User {
  id        Int      @id @default(autoincrement())
  phone     String   @unique
  name      String?
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
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
```

`Otp` alag table isliye hai ki ek phone ke liye OTP baar baar ban sakta hai. `codeHash` me asli OTP nahi, uska hash save hota hai. `attempts` se galat koshish ginte hain.

### Login kaise kaam karta hai

1. User phone number deta hai, `send-otp` route 6 digit OTP banata hai, uska hash database me save karta hai. Asli OTP abhi sirf server ke terminal me print hota hai (SMS baad me).
2. User OTP deta hai, `verify-otp` route hash match karta hai. Sahi hone par token deta hai. Naya phone ho to `User` apne aap ban jata hai (`upsert`).
3. Baad ke har request me header jata hai: `Authorization: Bearer <token>`. `requireAuth` middleware token check karta hai, `/me` batata hai ki kaun logged in hai.

### Security ki baatein jo code me hain

- OTP plain SHA se nahi, `JWT_SECRET` ke saath **HMAC** se hash hota hai, kyunki 6 digit ke sirf 10 lakh combinations hain aur seedha hash aasani se tod diya jata hai.
- OTP API ke response me kabhi nahi bheja jata.
- OTP **5 minute** me expire hota hai.
- Ek phone par **60 second** ke andar dobara OTP nahi (spam rokne ke liye).
- **5 galat koshish** ke baad wo OTP band, naya maangna padta hai.
- Sahi OTP ke baad record delete ho jata hai, to ek OTP sirf ek baar chalta hai.
- Hash ka match `timingSafeEqual` se hota hai.
- Production me OTP terminal me print nahi hota (`NODE_ENV !== "production"` par hi print).
- Token me `userId` aur `role` hai, abhi 30 din chalta hai (3.5.2 me badlega).
- `/users` ke test routes (GET aur POST) **hata diye gaye**, kyunki wo bina login ke saare users ke phone dikhate the.

## 6. Step 3.5.1: Hardening ka code (final haalat)

Naya folder structure (backend):

```
backend/
  index.ts
  app.ts
  config/env.ts
  lib/prisma.ts
  middleware/auth.ts
  middleware/validate.ts
  middleware/rateLimit.ts
  routes/auth.ts
  validators/auth.ts
  prisma/schema.prisma
  prisma/migrations/
  prisma.config.ts
  tsconfig.json
  package.json
  .env
  .gitignore
  generated/prisma
```

Install: `npm install zod helmet express-rate-limit`

### config/env.ts

`.env` me galti ho (jaise `JWT_SECRET` chhota ya gayab) to server shuru hi nahi hota.

```ts
import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL zaroori hai"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET kam se kam 32 character ka ho"),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  console.error(".env me galti:", problems.join(" | "));
  process.exit(1);
}

export const env = parsed.data;
```

### validators/auth.ts

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
```

### middleware/validate.ts

```ts
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0]?.message ?? "Galat data" });
    }
    req.body = result.data;
    next();
  };
```

### middleware/rateLimit.ts

Limit IP ke hisaab se hai aur abhi memory me chalti hai (server restart par reset). Live hone par, jab kai server honge, Redis se karenge.

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
```

### middleware/auth.ts

`requireRole` aage provider aur admin ke routes me kaam aayega (jaise `requireRole("PROVIDER")`).

```ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthedRequest = Request & {
  auth?: { userId: number; role: string };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const [type, token] = (req.headers.authorization ?? "").split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Login zaroori hai" });
  }

  try {
    const data = jwt.verify(token, env.JWT_SECRET) as { userId: number; role: string };
    req.auth = { userId: data.userId, role: data.role };
    next();
  } catch {
    res.status(401).json({ error: "Token galat ya expire hai, dobara login karo" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Aapko ye karne ki ijazat nahi hai" });
    }
    next();
  };
}
```

### routes/auth.ts

```ts
import { Router } from "express";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { validate } from "../middleware/validate.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimit.js";
import { sendOtpSchema, verifyOtpSchema } from "../validators/auth.js";

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

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ token, user });
  } catch (e) {
    next(e);
  }
});

export default router;
```

### app.ts

```ts
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./lib/prisma.js";
import authRouter from "./routes/auth.js";
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

### index.ts

```ts
import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => console.log(`Server ${env.PORT} par chalu`));
```

`/api/v1` prefix isliye hai ki baad me API badle to mobile app ka purana version `/api/v1` par chalta rahe aur naya `/api/v2` par jaye.

## 7. Test karne ke commands (PowerShell)

Saare URL me ab `/api/v1` lagta hai.

OTP maango (OTP **server wale terminal** me print hoga):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999"}'
```

OTP daalo aur token variable me rakho (`ASLI_OTP` ki jagah terminal wala 6 digit):
```
$r = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999","code":"ASLI_OTP"}'
$token = $r.token
```
Is command ke baad kuch print nahi hota, kyunki result `$r` me rakha hai. Ye theek hai. `$token` ko print mat karo aur chat me mat bhejo.

`/me` token ke saath (user ka data aana chahiye):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/me -Headers @{ Authorization = "Bearer $token" }
```

Galat cases (laal error aana chahiye, aur asli message dekhne ke liye `try/catch`):
```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/me } catch { $_.ErrorDetails.Message }
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/me -Headers @{ Authorization = "Bearer nakli.token.yahan" } } catch { $_.ErrorDetails.Message }
```
Pehle me "Login zaroori hai", dusre me "Token galat ya expire hai" aana chahiye.

3.5.1 ke test:
1. `Invoke-RestMethod -Uri http://localhost:5000/` se "Tiffin Ghar API chal rahi hai" aana chahiye.
2. Pura login phir se (upar wale commands) aur `/me` pehle ki tarah chalna chahiye.
3. Galat phone `{"phone":"123"}` bhejo, "Sahi 10 digit ka mobile number daalo" aana chahiye.
4. Rate limit dekhne ke liye:
   ```
   1..12 | ForEach-Object { try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999"}' } catch { $_.ErrorDetails.Message } }
   ```
   Shuru me "1 minute baad" wala error aayega, aur 11ve se "Bahut zyada OTP requests" aana chahiye. Server restart par ye limit hat jati hai.
5. `.env` me `JWT_SECRET` ko chhota (`abc`) karke `npm run dev` chalao. Server `.env me galti` likh kar band ho jana chahiye. Dekh kar `.env` wapas theek kar do.

Step 3 ke purane test ka matlab (agar kabhi dobara karna ho): galat OTP par "OTP galat hai", sahi OTP par `token` aur `user`, wahi sahi OTP dobara bhejne par "Pehle OTP maango". Naye number (jaise `8888888888`) se login karne par Prisma Studio me `User` table me naya row banta hai aur `Otp` table me us phone ka row hat jata hai.

## 8. Git ka tarika

Sab test pass hone ke baad hi commit karo, taki GitHub par chalta hua code jaye:

```
git status --short
git add .
git commit -m "Step 3.5.1: env check, zod validation, helmet, rate limit, /api/v1"
git push
```

- `git status --short` badli hui files dikhata hai. List me `.env` ya `node_modules` **nahi dikhna chahiye**. Dikhe to ruko aur pehle `.gitignore` theek karo.
- `git add .` badli hui files ko chunta hai, `git commit` save point banata hai, `git push` use GitHub par bhejta hai.
- Step 3 ka commit ho chuka hai (message: "Step 3: phone OTP login, JWT, /me route").

## 9. Discussion: baad me naya feature jodna aasan hai ya nahi

**Haan, aasan hai, kuch shuru se nahi banana padega.** Backend alag-alag hisson me banaya hai (routes, middleware, database). Naya feature jodna matlab naya code add karna hai, purana todna nahi.

Password login ka example:
1. `User` table me nayi column `passwordHash` (khaali bhi ho sakti hai). Ye ek migration hai.
2. Naye routes: `/auth/register-password`, `/auth/login-password`.
3. Wahi `jwt.sign` dono tareeke se token deta hai, to `/me` aur baaki routes bina badle chalenge.

Purane users aur OTP login par koi asar nahi padta. Google login, email login ya WhatsApp OTP bhi isi tarah baad me jud sakte hain.

**Salah:** tiffin app ke liye OTP hi main login rakho. India me customers aur providers (ghar ki aunty, chhota dukaandaar) ke liye OTP sabse aasan hai. Password ke saath "password bhul gaye" ka poora system, reset OTP aur zyada galtiyan aati hain. Baad me Google login jodna zyada kaam ka hai.

### Jo cheezein baad me badalna mushkil hai, shuru me hi sahi karni hain

- **Paisa/wallet ka design:** paisa hamesha integer me (paise me) save hoga, aur wallet ka balance ek number nahi, balki har credit/debit ka **ledger** (hisaab ki list) hoga. Step 8 me dhyan se karenge.
- **Token system:** abhi ek hi 30 din wala token hai, 3.5.2 me badlega.
- **Database ke rishte** (provider, menu, order, subscription): Step 4 se pehle soch kar banayenge.

## 10. Discussion: "professional" ka matlab

Tech stack (TypeScript, PostgreSQL, Prisma, Next.js, React Native, Razorpay) wahi hai jo aaj ke asli startups use karte hain, isme koi purani cheez nahi. Professional app ka matlab alag ya ajeeb technology nahi, balki **security, bharosemand kaam aur achhi user experience** hai.

Jo kami thi (aur 3.5.1 me ya aage solve ho rahi hai):
- Refresh token: abhi token 30 din ka hai, kho gaya to 30 din chal sakta hai. Professional tarika: chhota (15 minute) access token aur ek refresh token jo band kiya ja sake. (**3.5.2**)
- Rate limit: pehle sirf ek phone par rokta tha, ab IP par bhi (**3.5.1 me ho gaya**). SMS ka paisa jata hai isliye ye bahut zaroori hai.
- Input validation `zod` se (**3.5.1**), security headers `helmet` se (**3.5.1**), saaf error handling (**3.5.1**).
- Folder structure saaf (routes, middleware, validators, config) aur `/api/v1` prefix (**3.5.1**). Aage chal kar controllers/services alag karenge.
- Tests, logging aur error tracking (Sentry): baad me.

Asli professional features jo is app ke liye chahiye honge:
- **Nearby providers:** PostGIS (database me location ka search).
- **Roz ke subscription orders:** background jobs (BullMQ + Redis), kyunki roz subah apne aap orders banane hain.
- **Live tracking:** WebSocket (Socket.IO).
- **Push notifications:** Firebase (FCM).
- **SMS:** India me DLT registration chahiye hota hai, launch se pehle karna padega. SMS service (jaise MSG91 ya Twilio) baad me jodenge.
- **Wallet/payment:** RBI ke rules ke liye kisi expert se poochna.

User ne kaha: "kuchh achha hi app banao, chahe kuchh paisa lag jaye koi dikkat nahi, achha banana chahiye." Isliye hardening (Step 3.5) Step 4 se pehle kiya ja raha hai.

## 11. Agle kaam

### Step 3.5.2: refresh token (agla)

- Chhota access token (15 minute) aur lamba refresh token.
- Refresh token ko database me save karna (hash karke, `RefreshToken` table), taki use band (revoke) kiya ja sake. Logout par wo band hoga.
- Naye routes: `/auth/refresh`, `/auth/logout`.
- `verify-otp` ab dono token dega.

### Step 4: provider profile aur menu

1. `Provider` table: dukaan ka naam, shehar, pata, FSSAI number, khula/band. `User` se jude hoga (role `PROVIDER`).
2. `MenuItem` table: roz ka meal, daam (paise me, integer), aur kis din ka.
3. Routes: provider apni profile banaye aur badle, menu daale, dukaan khule/band kare. Sab `requireRole("PROVIDER")` se protected.
4. Database ke rishte pehle soch kar banayenge (provider, menu, order, subscription).

## 12. Jo dikkatein aayi aur unka hal

- **Prisma `8.0.0-rc.22` aaya:** `npm install prisma@7.10.0 --save-dev` aur `npm install @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0`.
- **`prisma init` ke flags nahi chale:** version 7.10.0 par `npx prisma init --output ../generated/prisma` chala.
- **Config file ka naam `prisma7.config.ts`:** `prisma.config.ts` me rename karna padta hai.
- **CommonJS vs import error:** `package.json` me `"type": "module"`.
- **`Property 'user' does not exist`** (ya `otp` ke liye): schema badalne ke baad `npx prisma generate` chalana bhoolna. Niyam: schema badlo, phir `npx prisma migrate dev --name naam`, phir `npx prisma generate`.
- **`.gitignore` me extra space:** line ke aage space hone par Git use ignore nahi karta. Terminal se `Set-Content -Path .gitignore -Value "node_modules",".env",...` se saaf likhi.
- **PostgreSQL service nahi mili:** install adhura tha, dobara poora install kiya.
- **JWT_SECRET wali command ka output nahi dikha:** command do line me toot gayi thi aur terminal `>>` par ruka tha. `Ctrl + C` dabao aur command ek hi line me chalao.
- **Laal error `InvalidOperation ... WebException`:** verify-otp me galat ya purana OTP dene par aata hai. Naya OTP maango aur terminal wala OTP daalo.
- **`$r = ...` command ke baad kuch print nahi hua:** theek hai, result `$r` me hai.

## 13. Zaroori baatein

- `npm audit fix --force` mat chalana. App live karne se pehle `npm audit` dekhenge. (Abhi "7 high severity vulnerabilities" dikhta hai, isko abhi andekha karo.)
- `npm warn install-scripts` wali chetavani abhi andekha karo. Agar engine/esbuild ka error aaye, to `npm install-scripts approve @prisma/engines prisma esbuild` chalao.
- `.env`, database password, `JWT_SECRET` aur login token kisi ko mat bhejo, chat me bhi nahi, aur screenshot me bhi mat dikhao. Token se koi bhi tumhare naam par login kar sakta hai.
- `cors()` abhi sabko ijazat deta hai. Live karne se pehle sirf apni website ka address denge.
- OTP abhi terminal me print hota hai. Asli SMS (DLT registration ke saath) launch se pehle jodni hai.
- Wallet ke RBI rules ke baare me kisi expert se poochna. Providers ko FSSAI chahiye. Pehle ek shehar me chalana, phir failana.

## 14. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, baad me Next.js website aur React Native mobile app). Is app ka startup bhi karna hai, to ise professional banana hai. Ye project notes file attach ki hai. Step 1, 2 aur 3 (phone OTP login, JWT, `/me`) poore ho gaye hain aur push ho gaye hain. Step 3.5.1 (env check, zod, helmet, rate limit, `/api/v1`) ka code notes me hai: mene [test aur commit kar diya hai / abhi karna baki hai]. Ab Step 3.5.2 (refresh token) se aage badhna hai, phir Step 4 (provider profile aur menu). Hinglish me step by step samjhao.
