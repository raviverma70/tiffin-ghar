# Tiffin Ghar: Notes (Step 5.1 public routes + Step 5.2 Next.js website, poora code aur saari test commands)

Ye file in teen files ke **saath** use karni hai: `tiffin-ghar-project-notes-step3.md` (Step 1, 2, 3, 3.5.1 ka code), `tiffin-ghar-project-notes-step3-5-1.md` (3.5.1 ke test, galtiyan) aur `tiffin-ghar-project-notes-step4.md` (refresh token, provider profile, menu ka code). Is file me wo sab hai jo uske baad hua: customers ke liye public routes (5.1) aur Next.js website (5.2), saath me **ab tak ki saari test commands (login samet)**. **Naye chat me chaaron files attach karo. Naye chat se Step 5.3 (website par customer login) shuru hoga.**

## 1. Abhi kahan hain

- Step 1, 2, 3, 3.5.1, 3.5.2, 4.1, 4.2: ho gaye, test pass, push hue.
- Step 5.1 (public routes: approved aur khule providers ki list, aaj ka menu): ho gaya, saare test pass.
- Step 5.2 (Next.js website: shehar dhundo, providers ki list, provider ka aaj ka menu): ho gaya, browser me chal raha hai, push hua. Commit: "Step 5.2: Next.js website with city search, provider list and today's menu".
- **Agla: Step 5.3** (website par customer login: phone, OTP, httpOnly cookie me tokens).
- Ek check baaki ho sakta hai: Step 5.2 ka commit `web` folder ke andar se hua tha. `tiffin-ghar` folder me `git status --short` chala kar dekho, `backend/...` ki koi file dikhe (Step 5.1 ke files) to `git add .`, `git commit -m "Step 5.1: public provider list and today's menu"`, `git push`.

## 2. Faisle jo tay hue

### Public routes (5.1)
- Public list me sirf `APPROVED` aur `isOpen: true` providers aate hain. Customer ko sirf `id`, `shopName`, `city`, `pincode` dikhte hain. `userId`, `fssaiNumber`, poora `address`, `status` bahar nahi jate (ghar se chalne walon ka pata abhi public nahi; order confirm hone ke baad dikhane ka faisla Step 6 me).
- Shehar case-insensitive match hota hai (`prayagraj` = `Prayagraj`). `page` aur `limit` (max 50) pagination pehle se hai.
- Aaj ka menu India ke time (`Asia/Kolkata`) ke hisaab se: `dayOfWeek` aaj ka ya `null` (har din), aur `isAvailable: true`.
- Band ya na-mili dukaan ka menu 404 deta hai (customer ko ye nahi dikhta ki profile `PENDING` thi ya band).
- `/providers/:id/menu` wali public route `/providers/me/...` ke **baad** mount hoti hai (`app.ts` me order zaroori hai).
- Query ki jaanch `validate()` se nahi, route ke andar `safeParse(req.query)` se (Express me `req.query` badalna theek nahi).

### Website (5.2)
- Next.js project `tiffin-ghar/web` me, `src/` directory ke saath, App Router, TypeScript, Tailwind, ESLint. **React Compiler aur Cache Components: No.**
- Pages Next.js ke **server** par chalte hain aur wahi se backend ko call karte hain (`API_URL` se), browser seedha backend ko call nahi karta. Isliye abhi **CORS ki zaroorat nahi**. CORS tab chahiye jab browser seedha backend ko call kare.
- `API_URL` sirf server ke liye hai, `NEXT_PUBLIC_` mat lagana. `.env.local` git me nahi jata.
- Daam backend me paise me hota hai, website par `formatPrice()` se rupaye me dikhta hai (`9500` -> `₹95`).
- Abhi ka design sirf kaam karne wala dhaancha hai (dark mode, simple cards). **Final design baad me ek alag step me** jab saare pages ban jayein (rang, hero banner, photos, logo, mobile design). Photos ke liye abhi database me koi field nahi, uske liye alag chhota step chahiye (upload + Cloudinary ya S3 + link database me).

### Step 5.3 ka tay hua tareeka (abhi bana nahi)
- Access aur refresh token **httpOnly cookie** me (browser ka JavaScript unhe padh nahi sakta). Access token 15 min, refresh 30 din.
- Login ka form Next.js **server action** se chalega (`send-otp` phir `verify-otp`), isliye CORS nahi chahiye.
- Access token khatam ho par refresh token ho to website ek route (`/session/refresh`) par bhejegi jo backend ke `/auth/refresh` se naya jodi le kar cookie badal degi (cookie badalna sirf route ya server action me ho sakta hai, page me nahi).
- Logout backend ke `/auth/logout` ko bhi bulayega aur cookies hatayega.
- Redirect me sirf apni website ka raasta (`/` se shuru) maanenge, bahar ka link nahi (open redirect se bachne ke liye).
- Files: `web/src/lib/session.ts`, `web/src/app/session/refresh/route.ts`, `web/src/app/login/actions.ts`, `web/src/app/login/page.tsx`, aur `web/src/app/page.tsx` me upar Login/Logout dikhana.

## 3. Final structure

`*` = Step 5 me naya, `~` = badla.

```
tiffin-ghar/
  backend/
    app.ts                      ~ publicProvidersRouter jura
    lib/
      time.ts                   * naya (todayInIndia)
    middleware/
      rateLimit.ts              ~ publicLimiter juda
    routes/
      publicProviders.ts        * naya
    validators/
      publicProvider.ts         * naya
  web/                          * naya (Next.js)
    .env.local                  * API_URL
    next.config.ts              ~ cacheComponents aur partialPrefetching hataye
    tsconfig.json               ~ paths: "@/*": ["./src/*"]
    src/
      lib/api.ts                * naya
      app/
        layout.tsx              (create-next-app wala, src/app me)
        globals.css             (create-next-app wala)
        page.tsx                ~ shehar dhundo + providers ki list
        provider/[id]/page.tsx  * aaj ka menu
```

## 4. Backend code (Step 5.1)

### backend/validators/publicProvider.ts

```ts
import { z } from "zod";

export const listProvidersQuery = z.object({
  city: z.string("Shehar likho").trim().min(2, "Shehar likho").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "6 digit ka pincode daalo").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
```

### backend/lib/time.ts

```ts
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 0 = Sunday ... 6 = Saturday, India ke time ke hisaab se
export function todayInIndia() {
  const short = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  return DAYS.indexOf(short);
}
```

### backend/middleware/rateLimit.ts

Sabse neeche ye line jodi (baaki file waisi hi):

```ts
export const publicLimiter = make(60_000, 60, "Bahut zyada requests, thoda ruko");
```

### backend/routes/publicProviders.ts

```ts
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { publicLimiter } from "../middleware/rateLimit.js";
import { listProvidersQuery } from "../validators/publicProvider.js";
import { todayInIndia } from "../lib/time.js";

const router = Router();

const publicProviderSelect = {
  id: true,
  shopName: true,
  city: true,
  pincode: true,
};

// Approved aur khule providers ki list
router.get("/", publicLimiter, async (req, res, next) => {
  try {
    const parsed = listProvidersQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { city, pincode, page, limit } = parsed.data;

    const where = {
      status: "APPROVED" as const,
      isOpen: true,
      city: { equals: city, mode: "insensitive" as const },
      ...(pincode ? { pincode } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.provider.findMany({
        where,
        select: publicProviderSelect,
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  } catch (e) {
    next(e);
  }
});

// Ek provider ka aaj ka menu
router.get("/:id/menu", publicLimiter, async (req, res, next) => {
  try {
    const id = Number(String(req.params.id));
    if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) {
      return res.status(400).json({ error: "Galat provider id" });
    }

    const provider = await prisma.provider.findFirst({
      where: { id, status: "APPROVED", isOpen: true },
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
      },
      orderBy: { id: "asc" },
    });

    res.json({ provider, day: today, items });
  } catch (e) {
    next(e);
  }
});

export default router;
```

### backend/app.ts me badlav

Upar import:

```ts
import publicProvidersRouter from "./routes/publicProviders.js";
```

Routes ka order (public wali line sabse neeche, `providersRouter` ke baad):

```ts
api.use("/auth", authRouter);
api.use("/providers/me/menu", menuRouter);
api.use("/providers", providersRouter);
api.use("/providers", publicProvidersRouter);
```

## 5. Website code (Step 5.2), sab `web` folder me

### web/.env.local

```
API_URL=http://localhost:5000/api/v1
```

`.env.local` badalne ke baad website ka server band karke dobara chalana padta hai (`Ctrl + C`, phir `npm run dev`).

### web/next.config.ts (poori file)

`create-next-app` ne `cacheComponents: true` aur `partialPrefetching: true` daal diya tha, wo hataye (hamare pages `searchParams` aur `cache: "no-store"` use karte hain, wo isse error dete).

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
```

### web/tsconfig.json me ek badlav

`src/` folder use karne ke liye `paths` ye hona chahiye:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

### web/src/lib/api.ts

```ts
const API_URL = process.env.API_URL ?? "http://localhost:5000/api/v1";

export type Provider = {
  id: number;
  shopName: string;
  city: string;
  pincode: string;
};

export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
  dayOfWeek: number | null;
};

export type TodayMenu = {
  provider: Provider;
  day: number;
  items: MenuItem[];
};

export async function getProviders(city: string) {
  const res = await fetch(`${API_URL}/providers?city=${encodeURIComponent(city)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Kuch gadbad hui, baad me try karo");
  }

  return (await res.json()) as {
    items: Provider[];
    total: number;
    page: number;
    limit: number;
  };
}

// Dukaan band ho ya mili na ho to null deta hai
export async function getMenu(id: string) {
  const res = await fetch(`${API_URL}/providers/${encodeURIComponent(id)}/menu`, {
    cache: "no-store",
  });

  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error("Kuch gadbad hui, baad me try karo");

  return (await res.json()) as TodayMenu;
}

// Paise ko rupaye me dikhao: 8500 -> ₹85
export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}
```

### web/src/app/page.tsx

```tsx
import Link from "next/link";
import { getProviders, type Provider } from "@/lib/api";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const query = city?.trim();

  let providers: Provider[] | null = null;
  let error = "";

  if (query) {
    try {
      providers = (await getProviders(query)).items;
    } catch (e) {
      error = e instanceof Error ? e.message : "Kuch gadbad hui";
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">Tiffin Ghar</h1>
      <p className="mt-1 text-gray-600">Ghar ka khana, aapke shehar me.</p>

      <form className="mt-6 flex gap-2">
        <input
          name="city"
          defaultValue={query}
          placeholder="Apna shehar likho (jaise Prayagraj)"
          className="flex-1 rounded border px-3 py-2"
        />
        <button className="rounded bg-orange-600 px-4 py-2 text-white">Dhundo</button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {providers && providers.length === 0 && (
        <p className="mt-4 text-gray-600">
          {query} me abhi koi khuli dukaan nahi mili.
        </p>
      )}

      {providers && providers.length > 0 && (
        <ul className="mt-6 space-y-3">
          {providers.map((p) => (
            <li key={p.id}>
              <Link
                href={`/provider/${p.id}`}
                className="block rounded border p-4 hover:bg-orange-50"
              >
                <p className="text-lg font-semibold">{p.shopName}</p>
                <p className="text-sm text-gray-600">
                  {p.city} - {p.pincode}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

### web/src/app/provider/[id]/page.tsx

Folder ka naam bilkul `[id]` (square brackets ke saath).

```tsx
import Link from "next/link";
import { getMenu, formatPrice } from "@/lib/api";

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
      <Link
        href={`/?city=${encodeURIComponent(provider.city)}`}
        className="text-orange-600"
      >
        &larr; {provider.city} ki dukaanein
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{provider.shopName}</h1>
      <p className="text-gray-600">
        {provider.city} - {provider.pincode}
      </p>

      <h2 className="mt-6 text-xl font-semibold">
        Aaj ka menu ({DAY_NAMES[day]})
      </h2>

      {items.length === 0 && (
        <p className="mt-4 text-gray-600">Aaj ke liye abhi koi item nahi hai.</p>
      )}

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
              </div>
              <p className="font-semibold">{formatPrice(item.pricePaise)}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

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
| `GET /api/v1/providers?city=...` | sab (bina login) | approved aur khule providers ki list (`pincode`, `page`, `limit` bhi) |
| `GET /api/v1/providers/:id/menu` | sab (bina login) | us provider ka aaj ka menu |

## 7. Saare test commands (PowerShell)

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

## 8. Jo galtiyan hui aur unke hal

- **PowerShell me kai commands ek line me jud gayi:** `$r = ...`, `$access = ...`, `$refresh = ...` alag-alag line par chalao.
- **`-ContentType` ki spelling:** `"application/json"` sahi hai.
- **Access token 15 minute me expire hota hai:** `Token galat ya expire hai` aaye to section B2 se refresh karo. Test ke beech ye baar-baar hoga. Variable `$access` ka length (167) bhara hone ka matlab ye nahi ki token chalta hai, wo expire ho sakta hai.
- **`$access2` customer ke liye:** provider route par 403 test ke liye alag variable.
- **Laal error `Object is possibly 'undefined'` (`issues[0]`):** `tsconfig` me `noUncheckedIndexedAccess` chalu hai, isliye `parsed.error.issues[0]?.message ?? "Galat input"` likhte hain.
- **Zod: shehar bilkul na bheja to `Invalid input: expected string, received undefined`:** `z.string("Shehar likho")` me message dena padta hai, sirf `.min(2, ...)` kaafi nahi.
- **`create-next-app` galat folder me chala:** prompt me `...\Ravi Kumar patel>` tha, `...\tiffin-ghar>` hona chahiye. `tiffin-ghar` ke andar jaakar chalao, `backend` me nahi.
- **`create-next-app` ke "recommended defaults" me `No src/ directory` aur `Cache Components` hain:** isliye **"No, customize settings"** chuno. `src/` directory **Yes**, Cache Components aur React Compiler **No**.
- **`next.config.ts` me `cacheComponents: true` aur `partialPrefetching: true` aa gaye:** dono hatao (section 5 ki poori file).
- **`Cannot find module '@/lib/api'`:** `src/` use karne par `tsconfig.json` ka `paths` `"@/*": ["./src/*"]` hona chahiye.
- **`web/app` aur `web/src/app` dono bane:** `web/app` me `layout.tsx`, `globals.css`, `favicon.ico` aur purana default `page.tsx` tha. Teen file `src/app` me `Move-Item` se le gaye, purana `page.tsx` aur khali `app` folder delete. Agar dono folder rahe to Next.js `src/app` ko ignore karta hai.
- **`.next` delete karne par problems dikhi:** normal hai, server chalane par apne aap thik ho jata hai.
- **`npm audit fix --force` mat chalana.** Naye Next.js project me ESLint ke 5 high severity vulnerabilities dikhti hain, wo dev tools ki hain. `install-scripts ... unrs-resolver blocked` warning par kuch karna nahi.
- **`LF will be replaced by CRLF` warning** git par: Windows par normal.
- **Step 5.2 ka commit `web` folder ke andar se hua:** `git add .` sirf wahi folder uthata hai. Hamesha `tiffin-ghar` folder se commit karo.
- **Token screenshot me mat dikhao.** `.env` bhi nahi.
- **Website dark dikhti hai:** ye Next.js ka default hai aur browser ki dark mode ki wajah se. Final design baad me.

## 9. Test numbers jo bane hain (sirf testing ke liye)

- `9999999999`: customer.
- `8888888888`: provider ("Sharma Ghar Ka Tiffin", Prayagraj, pincode 211001, provider `id` 1, status Prisma Studio se `APPROVED`, menu me kuch items, jinme `Aaj Ka Special` ka `id` 3 hai).

Ye asli numbers nahi hain, SMS abhi nahi jata. OTP backend wale terminal me print hota hai.

## 10. Kitna bacha hai

| Step | Kaam |
|---|---|
| **5.3** | Website par customer login (phone, OTP, httpOnly cookie). **Agla.** |
| 6 | Ek baar ka order: cart, order banana, order ki list, provider ko order dikhna, status badalna (accepted, ban raha, delivered). Backend + customer website + **provider dashboard** (abhi provider ka kaam PowerShell se hota hai, asli provider ke liye website par dashboard chahiye: profile, menu, orders). |
| Design step | Saare pages ban jane ke baad ek alag step: rang, hero banner, logo, font, mobile par achha dikhna, dukaan aur dish ki photos (iske liye pehle photo upload + storage + database field). Pasand ki 2-3 websites ka dhyan rakho. |
| 7 | Mobile app (React Native), website jaisa brand. |
| 8 | Subscription (monthly meals), wallet, payment. |
| 9 | Tracking, rating, admin panel (provider approve/reject, abhi Prisma Studio se). |

## 11. Zaroori baatein

- `npm audit fix --force` mat chalana.
- `.env`, database password, `JWT_SECRET`, access aur refresh token kisi ko mat bhejo, chat ya screenshot me bhi nahi.
- Purane expire hue refresh tokens table me jama hote rahenge. Background job (BullMQ) aane par saaf karenge.
- Rate limit abhi memory me hai (server restart par reset). Live par Redis.
- **Live se pehle:** website ke server se saare customers ke requests **ek hi IP** se aayenge, to backend ka IP-wala rate limit sabko mila kar gin lega. Backend me asli customer ka IP pass karwana padega (`trust proxy` aur `X-Forwarded-For`).
- Live se pehle `cors()` me sirf apni website ka address (abhi `cors()` sabko ijazat deta hai; website server se call karti hai, to abhi dikkat nahi, par mobile app ya browser se seedha call par chahiye hoga).
- OTP abhi terminal me print hota hai. Asli SMS (DLT registration ke saath) launch se pehle jodni hai.
- Nearby dukaanein (PostGIS, latitude/longitude) baad me. Abhi shehar aur pincode.
- Wallet aur payment ke liye RBI/Razorpay ka review kisi expert se karwana. Providers ko FSSAI chahiye.
- Hosting, domain, database backup, FSSAI check: launch se pehle.
- Har naye kaam se pehle `git commit`.

## 12. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, Next.js website, baad me React Native mobile app). Is app ka startup bhi karna hai, to ise professional banana hai. Chaar notes files attach ki hain (`tiffin-ghar-project-notes-step3.md`, `tiffin-ghar-project-notes-step3-5-1.md`, `tiffin-ghar-project-notes-step4.md` aur `tiffin-ghar-project-notes-step5.md`). Step 1 se 5.2 poore ho gaye aur GitHub par push hue: phone OTP login, JWT, refresh token (rotation), provider profile, menu (daam paise me), customers ke liye public routes, aur Next.js website (shehar dhundo, providers ki list, aaj ka menu). Ab Step 5.3 se shuru karna hai: website par customer login (phone, OTP, access aur refresh token httpOnly cookie me, access token khatam ho par refresh route, logout). Notes ke section 2 me tay hua tareeka likha hai. Hinglish me step by step samjhao, aur har file kis folder me banani hai ye saaf batao. Ek-ek command alag line me do. Jahan files banane ke baad kuch test karna ho, saari commands aur browser ke steps likh kar do.
