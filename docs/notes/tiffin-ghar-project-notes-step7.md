# Tiffin Ghar: Notes (Step 6.6 provider dashboard, login tabs, Step 6.7 admin panel: poora code aur saari test commands)

Ye file in paanch files ke **saath** use karni hai: `tiffin-ghar-project-notes-step3.md`, `tiffin-ghar-project-notes-step3-5-1.md`, `tiffin-ghar-project-notes-step4.md`, `tiffin-ghar-project-notes-step5.md` aur `tiffin-ghar-project-notes-step6.md`. Un files me Step 1 se 6.5 ka code hai. Is file me wo sab hai jo uske baad hua: provider ka dashboard (6.6), login par Customer/Provider tab, admin panel aur order ka live status (6.7). Saari commands (login samet, backend ke saare tests, website ke browser tests, git) is file me hain. **Naye chat me chhe files attach karo.**

## 1. Abhi kahan hain

- Step 1 se 6.5: ho gaye, test pass, push hue (`tiffin-ghar-project-notes-step6.md` me details).
- **Step 6.6** (provider dashboard website par: `/dashboard`, profile banana aur badalna, menu, dukaan khula/band, orders aur status buttons, role se sahi page `/start`): **ho gaya, test pass.**
- **Login par Customer / Provider tab** (`/login`): **ho gaya, test pass.**
- **Step 6.7** (admin panel `/admin`: providers approve/reject, stats; customer ka order page 15 second me apne aap badalna): **ho gaya, test pass.**
- Naye chat ke shuru me `tiffin-ghar` folder se `git status --short` chalao. Agar badli hui files dikhein (6.6/6.7 ki) to section 7.7 ke commands se commit aur push karo.
- **Agla: Batch C** (rating aur review, saath me photo upload ki taiyari). Section 11 me.

## 2. Faisle jo tay hue

### Role aur login
- Ek hi OTP login. Koi bhi number pehle `CUSTOMER`. Dukaan ki profile banate hi `PROVIDER`. `ADMIN` banane ke liye Prisma Studio me `User` table me `role` badalte hain (test admin `6666666666`).
- **Login page par Customer / Provider tab sirf "kahan bhejna hai" tay karta hai, role nahi.** Provider tab: login ke baad `/start` (PROVIDER ko `/dashboard`, ADMIN ko `/admin`, naya user home par). Customer tab: home. `?as=provider` ya `?as=customer` se tab chunta hai, nahi to `next` dekhkar (`/start`, `/dashboard` par provider). Khaas page (jaise `/orders`) se aaye to wahi `next` bacha rehta hai.
- Profile banane ke baad purane token me role `CUSTOMER` hota hai. `createProfileAction` profile banate hi `refreshInline()` se naya token leta hai. Agar kabhi backend 403 de (token me purana role), to `providerFetch` page par `/session/refresh` bhejta hai aur server action me khud refresh karke ek baar dobara try karta hai. Dashboard ke pages pehle `/me` se role (database se) dekhte hain, taaki 403 par loop na bane.
- Website par cookies: `tg_access` (14 minute) aur `tg_refresh` (30 din), httpOnly.

### Dashboard (provider)
- Dukaan khula/band karne ka button sirf `APPROVED` par dikhta hai. `PENDING` par "Approval ka intezaar", `REJECTED` par "approve nahi hui". Menu `PENDING` par bhi banta hai.
- **Daam rupaye me likhte hain, paise me bhejte hain** (`85.50` se `8550`). `rupeesToPaise` string ko seedha todta hai (float nahi), 1 se 5 digit rupaye aur 0 se 2 digit paise.
- Form ke fields `useState` se controlled hain, kyunki React 19 form action ke baad uncontrolled fields khali kar deta hai aur error aane par likha hua mit jata.
- Naya menu item jud jaye to `redirect("/dashboard/menu?added=...")` se form khali hota hai (page par `key` badalti hai, koi effect nahi).
- Order buttons (`NEXT_STATUSES`) backend ke `ALLOWED_FROM` jaise hi: `PLACED` se `ACCEPTED`/`REJECTED`; `ACCEPTED` se `PREPARING`/`REJECTED`; `PREPARING` se `OUT_FOR_DELIVERY`; `OUT_FOR_DELIVERY` se `DELIVERED`. Mana karne par "pakka?" ka box aata hai.
- Provider ko order me customer ka phone (`tel:` link) aur delivery ka pata dikhta hai, total ke saath "COD, customer se cash lena".
- Orders page har 30 second me aur customer ka order page (jab tak `PLACED`, `ACCEPTED`, `PREPARING`, `OUT_FOR_DELIVERY`) har 15 second me `router.refresh()` karta hai (tab dikh raha ho tabhi).
- Provider ka menu hatane par purane orders me item ka naam aur daam bacha rehta hai (`OrderItem` me copy hai).

### Admin
- `/admin`: stats ke dabbe, filter (Approval ke intezaar / Approved / Reject / Sab), har dukaan par Approve aur Reject (confirm ke saath). Approve ke alawa kuch bhi karne par dukaan ka `isOpen` `false` ho jata hai (backend me). Sirf `ADMIN` role dekh sakta hai, baaki home par bhej diye jate hain.
- Backend: `requireRole("ADMIN")` poore `admin` router par.
- Admin ke liye bhi website me `providerFetch` hi use hota hai (wo kisi bhi 403 par naya token le leta hai).

### Bhasha (language) ka faisla
- Abhi saara text Hinglish me code me likha hai, backend ke error bhi Hinglish me. **User ko bhasha chunne ka option baad me ek alag "Bhasha step" me** (design step ke baad, mobile app se pehle). Poora code nahi badlega, sirf text files me niklega (`next-intl`, mobile me `i18next`), `User` table me `language` field, backend error ke saath ek `code`. Pehle Hindi aur English. Dish aur dukaan ke naam translate nahi hote.

### Kaam karne ka tareeka
- **Kai steps ek saath (batch) banao jab usse rework ya toot-phoot na ho**, aur ek hi test round. Notes me **hamesha saari commands (login aur har test command)** rakhna, sirf code nahi.
- Server pages me `searchParams` ek `Promise` hota hai (Next.js 16): `const { x } = await searchParams`.
- `redirect()` try/catch ke andar mat rakho.
- Har naye kaam se pehle `git commit`. Hamesha `tiffin-ghar` folder se.

## 3. Final structure (Step 6.6 aur 6.7 ke baad)

`*` = naya, `~` = badla.

```
tiffin-ghar/
  backend/
    app.ts                          ~ adminRouter juda (/admin)
    routes/admin.ts                 * stats, providers list, status badalna
    validators/admin.ts             * listAdminProvidersQuery, setProviderStatusSchema
  web/src/
    app/
      page.tsx                      ~ links form ke bahar, DashboardLink
      login/page.tsx                ~ Customer / Provider tab
      start/page.tsx                * role se sahi page par bhejta hai
      dashboard/
        actions.ts                  * profile, open/close, menu, order status actions
        page.tsx                    * dukaan ka home
        profile-form.tsx            * create / edit form (client)
        menu/page.tsx               * menu ki list
        menu/item-form.tsx          * item ka form (client)
        orders/page.tsx             * orders aur status buttons
      admin/
        actions.ts                  * provider approve/reject
        page.tsx                    * admin panel
      orders/[id]/page.tsx          ~ AutoRefresh juda
    components/
      dash-nav.tsx                  * Dukaan | Menu | Orders
      dashboard-link.tsx            * home par Dashboard / Admin / Apni dukaan kholo
      auto-refresh.tsx              * router.refresh() har N second (client)
      confirm-button.tsx            * "pakka?" wala button (client)
    lib/
      authed.ts                     ~ refreshInline ab export hota hai
      provider.ts                   * types, labels, rupeesToPaise
      provider-api.ts               * providerFetch, requireProviderUser
      admin.ts                      * AdminProvider, AdminStats, filters
```

(`web/src/app/join` agar bana ho to hata do, ab zaroori nahi.)

## 4. Code

### Backend (Step 6.7)

#### backend/validators/admin.ts (naya)

```ts
import { z } from "zod";

export const listAdminProvidersQuery = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], "Status galat hai").optional(),
  page: z.coerce.number().int().min(1, "Page 1 ya usse bada hona chahiye").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit 1 se 50 ke beech rakho")
    .max(50, "Limit 1 se 50 ke beech rakho")
    .default(20),
});

export const setProviderStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], "Status galat hai"),
});
```

#### backend/routes/admin.ts (naya)

```ts
import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listAdminProvidersQuery, setProviderStatusSchema } from "../validators/admin.js";

const router = Router();

// Is router ke saare routes sirf ADMIN ke liye
router.use(requireAuth, requireRole("ADMIN"));

function parseId(value: unknown) {
  const id = Number(String(value));
  return Number.isInteger(id) && id >= 1 && id <= 2_147_483_647 ? id : null;
}

// Chhote stats
router.get("/stats", async (_req, res, next) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [users, pending, approved, rejected, orders, orders24h, delivered] =
      await prisma.$transaction([
        prisma.user.count(),
        prisma.provider.count({ where: { status: "PENDING" } }),
        prisma.provider.count({ where: { status: "APPROVED" } }),
        prisma.provider.count({ where: { status: "REJECTED" } }),
        prisma.order.count(),
        prisma.order.count({ where: { createdAt: { gte: since } } }),
        prisma.order.count({ where: { status: "DELIVERED" } }),
      ]);

    res.json({
      users,
      providersPending: pending,
      providersApproved: approved,
      providersRejected: rejected,
      orders,
      orders24h,
      delivered,
    });
  } catch (e) {
    next(e);
  }
});

// Providers ki list (?status=PENDING), naya pehle
router.get("/providers", async (req, res, next) => {
  try {
    const parsed = listAdminProvidersQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Galat input" });
    }
    const { status, page, limit } = parsed.data;
    const where = status ? { status } : {};

    const [items, total] = await prisma.$transaction([
      prisma.provider.findMany({
        where,
        include: {
          user: { select: { phone: true } },
          _count: { select: { menuItems: true, orders: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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

// Approve / reject / wapas pending
router.patch("/providers/:id/status", validate(setProviderStatusSchema), async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: "Galat provider id" });
    const { status } = req.body as z.infer<typeof setProviderStatusSchema>;

    // Approved ke alawa kuch bhi ho to dukaan band bhi kar do
    const result = await prisma.provider.updateMany({
      where: { id },
      data: status === "APPROVED" ? { status } : { status, isOpen: false },
    });
    if (result.count === 0) return res.status(404).json({ error: "Provider nahi mila" });

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: { select: { phone: true } } },
    });
    res.json(provider);
  } catch (e) {
    next(e);
  }
});

export default router;
```

#### backend/app.ts me do badlav

Upar imports me:

```ts
import adminRouter from "./routes/admin.js";
```

Aur `api.use("/orders", ordersRouter);` ke neeche:

```ts
api.use("/admin", adminRouter);
```

### Website: lib

#### web/src/lib/authed.ts me ek shabd badlo

`async function refreshInline()` ke aage `export` lagao, baaki kuch nahi badalna:

```ts
export async function refreshInline(): Promise<string | null> {
```

#### web/src/lib/provider.ts (naya)

```ts
import type { OrderItem, OrderStatus } from "@/lib/orders";

export type ProviderProfile = {
  id: number;
  shopName: string;
  city: string;
  address: string;
  pincode: string;
  fssaiNumber: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isOpen: boolean;
};

export type DashMenuItem = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  dayOfWeek: number | null;
  isVeg: boolean;
  isAvailable: boolean;
};

export type ProviderOrder = {
  id: number;
  status: OrderStatus;
  paymentMethod: string;
  totalPaise: number;
  deliveryAddress: string;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
  user: { phone: string };
};

export const DAY_NAMES = [
  "Ravivar",
  "Somvar",
  "Mangalvar",
  "Budhvar",
  "Guruvar",
  "Shukravar",
  "Shanivar",
];

// Provider ko status aise dikhte hain (customer wale label se alag)
export const PROVIDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: "Naya order",
  ACCEPTED: "Accept kiya",
  PREPARING: "Ban raha hai",
  OUT_FOR_DELIVERY: "Raaste me hai",
  DELIVERED: "Pahunch gaya",
  REJECTED: "Mana kiya",
  CANCELLED: "Customer ne cancel kiya",
};

export type NextStatus = "ACCEPTED" | "REJECTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";

// Backend ke ALLOWED_FROM jaisa hi: kis status se aage kya ho sakta hai
export const NEXT_STATUSES: Partial<Record<OrderStatus, NextStatus[]>> = {
  PLACED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING", "REJECTED"],
  PREPARING: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export const ACTION_LABEL: Record<NextStatus, string> = {
  ACCEPTED: "Accept karo",
  REJECTED: "Mana karo",
  PREPARING: "Ban raha hai",
  OUT_FOR_DELIVERY: "Raaste me hai",
  DELIVERED: "Pahunch gaya",
};

export const FILTERS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Sab" },
  { value: "PLACED", label: "Naye" },
  { value: "ACCEPTED", label: "Accept kiye" },
  { value: "PREPARING", label: "Ban raha hai" },
  { value: "OUT_FOR_DELIVERY", label: "Raaste me" },
  { value: "DELIVERED", label: "Pahunch gaye" },
  { value: "REJECTED", label: "Mana kiye" },
  { value: "CANCELLED", label: "Cancel" },
];

// "85" ya "85.50" (rupaye) -> 8500 ya 8550 (paise). Galat likha ho to null.
export function rupeesToPaise(input: string): number | null {
  const s = input.trim().replace(/^₹\s*/, "");
  const m = /^(\d{1,5})(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
}

// 8500 -> "85", 8550 -> "85.50" (edit form ke liye)
export function paiseToRupees(paise: number) {
  const r = paise / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2);
}
```

#### web/src/lib/provider-api.ts (naya)

Provider (aur admin) ke routes bulane ke liye. Backend 403 de (token me purana role) to khud refresh karwa leta hai.

```ts
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { authedFetch, refreshInline } from "@/lib/authed";
import { getCurrentUser } from "@/lib/session";

type Opts = {
  mode: "page" | "action";
  returnTo: string;
  method?: string;
  body?: unknown;
};

export async function providerFetch(path: string, opts: Opts): Promise<Response> {
  const res = await authedFetch(path, opts);
  if (res.status !== 403) return res;

  // 403: token me purana role ho sakta hai (profile abhi bani). Naya token lo.
  const next = encodeURIComponent(opts.returnTo);
  if (opts.mode === "page") redirect(`/session/refresh?next=${next}`);

  const fresh = await refreshInline();
  if (!fresh) redirect(`/login?next=${next}`);

  try {
    return await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        Authorization: `Bearer ${fresh}`,
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

// Menu aur orders ke pages ke liye: login zaroori, aur role PROVIDER hona chahiye
export async function requireProviderUser(returnTo: string) {
  const user = await getCurrentUser(returnTo);
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  if (user.role !== "PROVIDER") redirect("/dashboard");
  return user;
}
```

#### web/src/lib/admin.ts (naya)

```ts
import type { ProviderProfile } from "@/lib/provider";

export type AdminProvider = ProviderProfile & {
  createdAt: string;
  user: { phone: string };
  _count: { menuItems: number; orders: number };
};

export type AdminStats = {
  users: number;
  providersPending: number;
  providersApproved: number;
  providersRejected: number;
  orders: number;
  orders24h: number;
  delivered: number;
};

export const ADMIN_FILTERS = [
  { value: "PENDING", label: "Approval ke intezaar" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Reject kiye" },
  { value: "ALL", label: "Sab" },
];

export const PROVIDER_STATUS_TEXT: Record<string, string> = {
  PENDING: "Approval ke intezaar",
  APPROVED: "Approved",
  REJECTED: "Reject kiya",
};
```

### Website: components (`web/src/components/`)

#### dash-nav.tsx

```tsx
import Link from "next/link";

const TABS = [
  { key: "home", href: "/dashboard", label: "Dukaan" },
  { key: "menu", href: "/dashboard/menu", label: "Menu" },
  { key: "orders", href: "/dashboard/orders", label: "Orders" },
];

export default function DashNav({ active }: { active: "home" | "menu" | "orders" }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 border-b pb-3">
      <Link href="/" className="mr-2 text-orange-600">
        &larr; Website
      </Link>
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={
            t.key === active
              ? "rounded bg-orange-600 px-3 py-1 text-white"
              : "rounded border px-3 py-1 hover:bg-orange-50"
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
```

#### dashboard-link.tsx

```tsx
import Link from "next/link";
import { getSession } from "@/lib/session";

// Home par: provider ko "Dashboard", admin ko "Admin", customer ko "Apni dukaan kholo"
export default async function DashboardLink() {
  const session = await getSession();
  if (session.status !== "user") return null;

  const role = session.user.role;
  const href = role === "ADMIN" ? "/admin" : "/dashboard";
  const label = role === "ADMIN" ? "Admin" : role === "PROVIDER" ? "Dashboard" : "Apni dukaan kholo";

  return (
    <Link href={href} className="text-orange-600">
      {label}
    </Link>
  );
}
```

#### auto-refresh.tsx

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return null;
}
```

#### confirm-button.tsx

```tsx
"use client";

import type { ReactNode } from "react";

// message de do to click par pehle "pakka?" poochta hai
export default function ConfirmButton({
  message,
  className,
  children,
}: {
  message?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (message && !window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
```

### Website: pages (login, start, home)

#### web/src/app/start/page.tsx

Role dekhkar bhejta hai. (`redirect()` ke baad `return` zaroori hai, nahi to Next.js "default export is not a React Component" error deta hai.)

```tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function StartPage() {
  const user = await getCurrentUser("/start");
  const target = !user
    ? "/login?next=%2Fstart"
    : user.role === "PROVIDER"
      ? "/dashboard"
      : user.role === "ADMIN"
        ? "/admin"
        : "/";

  redirect(target);

  return <p>Ruko...</p>;
}
```

#### web/src/app/login/page.tsx (Customer / Provider tab)

`LoginForm.tsx` (alag file, notes me nahi) jaisa hai waisa rahta hai. `key={role}` se tab badalne par form saaf ho jata hai.

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, safeNext } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; as?: string }>;
}) {
  const { next, as } = await searchParams;
  const nextPath = safeNext(next);

  // Tab: ?as= se, nahi to next dekhkar tay karo
  const role: "customer" | "provider" =
    as === "provider" || as === "customer"
      ? as
      : nextPath.startsWith("/start") || nextPath.startsWith("/dashboard")
        ? "provider"
        : "customer";

  // Provider tab me jab tak koi khaas page (jaise /orders) na ho, login ke baad /start
  const target = role === "provider" && nextPath === "/" ? "/start" : nextPath;

  // Pehle se login hai to seedha aage bhejo
  const session = await getSession();
  if (session.status === "user") redirect(target);

  // Tab badalte waqt khaas page yaad rakho (provider ke apne raaste nahi)
  const keep =
    nextPath !== "/" && !nextPath.startsWith("/start") && !nextPath.startsWith("/dashboard")
      ? `&next=${encodeURIComponent(nextPath)}`
      : "";

  const tab = (r: "customer" | "provider") =>
    r === role
      ? "flex-1 rounded bg-orange-600 px-3 py-2 text-center font-semibold text-white"
      : "flex-1 rounded border px-3 py-2 text-center hover:bg-orange-50";

  return (
    <main className="mx-auto max-w-md p-6">
      <Link href="/" className="text-orange-600">
        &larr; Wapas
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Login</h1>

      <div className="mt-4 flex gap-2">
        <Link href={`/login?as=customer${keep}`} className={tab("customer")}>
          Customer
        </Link>
        <Link href={`/login?as=provider${keep}`} className={tab("provider")}>
          Provider
        </Link>
      </div>

      <p className="mt-4 text-gray-600">
        {role === "provider"
          ? "Apni tiffin dukaan sambhalne ke liye login karo. Pehli baar ho to login ke baad dukaan ki profile bharni hogi."
          : "Tiffin order karne ke liye apne mobile number se login karo, OTP aayega."}
      </p>

      <LoginForm key={role} next={target} />
    </main>
  );
}
```

#### web/src/app/login/actions.ts (tumhara maujooda, badla nahi, yaad ke liye)

```ts
"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { clearSession, getRefreshToken, safeNext, setSession } from "@/lib/session";

export type LoginState = {
  step: "phone" | "otp";
  phone: string;
  error: string;
};

type VerifyResponse = { accessToken: string; refreshToken: string };
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function callApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: json?.error ?? "Kuch gadbad hui, baad me try karo" };
    }
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "Server se baat nahi ho pa rahi, baad me try karo" };
  }
}

export async function loginAction(
  prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // "Number badlo" button
  if (formData.get("intent") === "back") {
    return { step: "phone", phone: prev.phone, error: "" };
  }

  // Step 1: OTP maango
  if (prev.step === "phone") {
    const phone = String(formData.get("phone") ?? "").trim();
    const result = await callApi<unknown>("/auth/send-otp", { phone });
    if (!result.ok) return { step: "phone", phone, error: result.error };
    return { step: "otp", phone, error: "" };
  }

  // Step 2: OTP check karo
  const code = String(formData.get("code") ?? "").trim();
  const next = safeNext(String(formData.get("next") ?? "/"));

  const result = await callApi<VerifyResponse>("/auth/verify-otp", {
    phone: prev.phone,
    code,
  });
  if (!result.ok) return { step: "otp", phone: prev.phone, error: result.error };

  await setSession(result.data.accessToken, result.data.refreshToken);
  redirect(next); // redirect try/catch ke bahar hi rakhna
}

export async function logoutAction() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await callApi<unknown>("/auth/logout", { refreshToken });
  }
  await clearSession();
  redirect("/");
}
```

#### web/src/app/page.tsx (home, poora, abhi ka)

Links ab `<form>` ke bahar hain, sirf Logout form ke andar.

```tsx
import Link from "next/link";
import { getProviders, type Provider } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/app/login/actions";
import DashboardLink from "@/components/dashboard-link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;

  const query = city?.trim();

  // Login ke baad isi page par wapas aane ke liye
  const here = query ? `/?city=${encodeURIComponent(query)}` : "/";
  const user = await getCurrentUser(here);

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tiffin Ghar</h1>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{user.phone}</span>
            <Link href="/orders" className="text-orange-600">
              Mere orders
            </Link>
            <DashboardLink />
            <form action={logoutAction}>
              <button className="rounded border px-3 py-1">Logout</button>
            </form>
          </div>
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(here)}`}
            className="rounded border px-3 py-1 text-sm"
          >
            Login
          </Link>
        )}
      </div>
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

#### web/src/app/orders/[id]/page.tsx me badlav (customer ka order live)

Upar imports me:

```tsx
import AutoRefresh from "@/components/auto-refresh";
```

Aur `const order = (await res.json()) as Order;` ke baad wale `return (` ke andar, `<main className="mx-auto max-w-2xl p-6">` ki **theek agli line** me (order wale `main` me, "Ye order nahi mila" wale me nahi, warna `order` abhi bana nahi hota aur TS2448 error aata hai):

```tsx
      {["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status) && (
        <AutoRefresh seconds={15} />
      )}
```

### Website: dashboard (`web/src/app/dashboard/`)

#### actions.ts

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch, refreshInline } from "@/lib/authed";
import { providerFetch } from "@/lib/provider-api";
import { rupeesToPaise } from "@/lib/provider";

export type FormState = { error: string; saved?: boolean };

const GENERIC = "Kuch gadbad hui, baad me try karo";
const NEXT_STATUS_LIST = ["ACCEPTED", "REJECTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

async function errorOf(res: Response) {
  const data = await res.json().catch(() => null);
  return (data?.error as string | undefined) ?? GENERIC;
}

// Wapas page par bhejo, upar ek chhota message ke saath (?notice=...)
function withNotice(path: string, notice: string) {
  const url = new URL(path, "http://local");
  url.searchParams.set("notice", notice.slice(0, 200));
  return url.pathname + url.search;
}

// ---------- Dukaan ki profile ----------

function profileBody(fd: FormData) {
  const fssai = text(fd, "fssaiNumber");
  return {
    shopName: text(fd, "shopName"),
    city: text(fd, "city"),
    address: text(fd, "address"),
    pincode: text(fd, "pincode"),
    fssaiNumber: fssai || undefined,
  };
}

export async function createProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const res = await authedFetch("/providers", {
    mode: "action",
    returnTo: "/dashboard",
    method: "POST",
    body: profileBody(fd),
  });
  if (!res.ok) return { error: await errorOf(res) };

  // Role CUSTOMER se PROVIDER ho gaya, par purane token me purana role hai. Naya token lo.
  await refreshInline();

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const res = await providerFetch("/providers/me", {
    mode: "action",
    returnTo: "/dashboard",
    method: "PATCH",
    body: profileBody(fd),
  });
  if (!res.ok) return { error: await errorOf(res) };

  revalidatePath("/dashboard");
  return { error: "", saved: true };
}

export async function toggleOpenAction(fd: FormData): Promise<void> {
  const isOpen = text(fd, "isOpen") === "true";
  const res = await providerFetch("/providers/me/open", {
    mode: "action",
    returnTo: "/dashboard",
    method: "PATCH",
    body: { isOpen },
  });
  if (!res.ok) redirect(withNotice("/dashboard", await errorOf(res)));
  revalidatePath("/dashboard");
}

// ---------- Menu ----------

type MenuBody = {
  name: string;
  description: string | undefined;
  pricePaise: number;
  dayOfWeek: number | null;
  isVeg: boolean;
  isAvailable: boolean;
};

type MenuForm = { error: string; body: null } | { error: null; body: MenuBody };

function readMenuForm(fd: FormData, forUpdate: boolean): MenuForm {
  const price = rupeesToPaise(text(fd, "price"));
  if (price === null) {
    return { error: "Daam rupaye me likho (jaise 85 ya 85.50)", body: null };
  }

  const day = text(fd, "dayOfWeek");
  if (day !== "" && !/^[0-6]$/.test(day)) {
    return { error: "Din galat hai", body: null };
  }

  const description = text(fd, "description");
  return {
    error: null,
    body: {
      name: text(fd, "name"),
      // update me khali "" bhejte hain taaki purana description hat sake
      description: description || (forUpdate ? "" : undefined),
      pricePaise: price,
      dayOfWeek: day === "" ? null : Number(day),
      isVeg: fd.get("isVeg") === "on",
      isAvailable: fd.get("isAvailable") === "on",
    },
  };
}

export async function createMenuItemAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = readMenuForm(fd, false);
  if (!parsed.body) return { error: parsed.error };

  const res = await providerFetch("/providers/me/menu", {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "POST",
    body: parsed.body,
  });
  if (!res.ok) return { error: await errorOf(res) };

  revalidatePath("/dashboard/menu");
  // ?added=... se form naya khali ban jata hai (page par key badalti hai)
  redirect(`/dashboard/menu?added=${Date.now()}`);
}

export async function updateMenuItemAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = text(fd, "id");
  if (!/^\d{1,10}$/.test(id)) return { error: "Galat item" };

  const parsed = readMenuForm(fd, true);
  if (!parsed.body) return { error: parsed.error };

  const res = await providerFetch(`/providers/me/menu/${id}`, {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "PATCH",
    body: parsed.body,
  });
  if (!res.ok) return { error: await errorOf(res) };

  revalidatePath("/dashboard/menu");
  redirect("/dashboard/menu");
}

export async function toggleAvailableAction(fd: FormData): Promise<void> {
  const id = text(fd, "id");
  if (!/^\d{1,10}$/.test(id)) redirect("/dashboard/menu");

  const res = await providerFetch(`/providers/me/menu/${id}`, {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "PATCH",
    body: { isAvailable: text(fd, "available") === "true" },
  });
  if (!res.ok) redirect(withNotice("/dashboard/menu", await errorOf(res)));
  revalidatePath("/dashboard/menu");
}

export async function deleteMenuItemAction(fd: FormData): Promise<void> {
  const id = text(fd, "id");
  if (!/^\d{1,10}$/.test(id)) redirect("/dashboard/menu");

  const res = await providerFetch(`/providers/me/menu/${id}`, {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "DELETE",
  });
  if (!res.ok) redirect(withNotice("/dashboard/menu", await errorOf(res)));
  revalidatePath("/dashboard/menu");
}

// ---------- Orders ----------

export async function updateOrderStatusAction(fd: FormData): Promise<void> {
  const id = text(fd, "id");
  const status = text(fd, "status");
  const rawBack = text(fd, "back");
  const back = rawBack.startsWith("/dashboard/orders") ? rawBack : "/dashboard/orders";

  if (!/^\d{1,10}$/.test(id) || !NEXT_STATUS_LIST.includes(status)) redirect(back);

  const res = await providerFetch(`/providers/me/orders/${id}/status`, {
    mode: "action",
    returnTo: back,
    method: "PATCH",
    body: { status },
  });

  // Customer ne beech me cancel kar diya ho to 409 aata hai, message upar dikhega
  if (!res.ok) redirect(withNotice(back, await errorOf(res)));
  redirect(back);
}
```

#### page.tsx (dukaan ka home)

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { providerFetch } from "@/lib/provider-api";
import type { ProviderProfile } from "@/lib/provider";
import DashNav from "@/components/dash-nav";
import ProfileForm from "./profile-form";
import { toggleOpenAction } from "./actions";

function NewProfile() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Apni dukaan kholo</h1>
      <p className="mt-1 text-gray-600">
        Dukaan ki jaankari bharo. Admin approve karega tab customers ko dikhegi.
      </p>
      <div className="mt-6">
        <ProfileForm mode="create" />
      </div>
    </main>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;

  const user = await getCurrentUser("/dashboard");
  if (!user) redirect("/login?next=%2Fdashboard");

  if (user.role === "ADMIN") {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; Home
        </Link>
        <p className="mt-6 text-gray-600">
          Admin ke liye <Link href="/admin" className="text-orange-600">/admin</Link> panel hai.
        </p>
      </main>
    );
  }

  if (user.role !== "PROVIDER") return <NewProfile />;

  const res = await providerFetch("/providers/me", {
    mode: "page",
    returnTo: "/dashboard",
  });
  if (res.status === 404) return <NewProfile />;
  if (!res.ok) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <DashNav active="home" />
        <p className="mt-6 text-red-600">Profile nahi la paye, baad me try karo.</p>
      </main>
    );
  }
  const p = (await res.json()) as ProviderProfile;

  const ordersRes = await providerFetch("/providers/me/orders?status=PLACED&limit=1", {
    mode: "page",
    returnTo: "/dashboard",
  });
  const newOrders = ordersRes.ok ? ((await ordersRes.json()) as { total: number }).total : null;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <DashNav active="home" />

      <h1 className="mt-6 text-2xl font-bold">{p.shopName}</h1>
      <p className="text-gray-600">
        {p.city} - {p.pincode}
      </p>

      {notice && (
        <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>
      )}

      {p.status === "PENDING" && (
        <p className="mt-4 rounded border border-yellow-600 p-3">
          Approval ka intezaar. Admin approve karega tab dukaan khul payegi. Tab tak aap menu bana
          sakte ho.
        </p>
      )}

      {p.status === "REJECTED" && (
        <p className="mt-4 rounded border border-red-600 p-3 text-red-600">
          Aapki profile approve nahi hui. Jaankari theek karke admin se baat karo.
        </p>
      )}

      {p.status === "APPROVED" && (
        <div className="mt-4 rounded border p-4">
          <p className="font-semibold">
            Dukaan abhi {p.isOpen ? "khuli hai (customers ko dikh rahi hai)" : "band hai"}
          </p>
          <form action={toggleOpenAction} className="mt-3">
            <input type="hidden" name="isOpen" value={String(!p.isOpen)} />
            <button
              className={
                p.isOpen
                  ? "rounded border border-red-600 px-4 py-2 text-red-600"
                  : "rounded bg-orange-600 px-4 py-2 text-white"
              }
            >
              {p.isOpen ? "Dukaan band karo" : "Dukaan kholo"}
            </button>
          </form>
        </div>
      )}

      <Link
        href="/dashboard/orders?status=PLACED"
        className="mt-4 block rounded border p-4 hover:bg-orange-50"
      >
        <p className="font-semibold">
          Naye orders: {newOrders === null ? "-" : newOrders}
        </p>
        <p className="text-sm text-gray-600">Orders dekho aur status badlo &rarr;</p>
      </Link>

      <div className="mt-6 text-sm text-gray-600">
        <p>Pata: {p.address}</p>
        <p>FSSAI: {p.fssaiNumber ?? "daala nahi"}</p>
      </div>

      <details className="mt-6 rounded border p-4">
        <summary className="cursor-pointer font-semibold">Profile badlo</summary>
        <div className="mt-4">
          <ProfileForm mode="edit" profile={p} />
        </div>
      </details>
    </main>
  );
}
```

#### profile-form.tsx

```tsx
"use client";

import { useActionState, useState } from "react";
import { createProfileAction, updateProfileAction, type FormState } from "./actions";

type Profile = {
  shopName: string;
  city: string;
  address: string;
  pincode: string;
  fssaiNumber: string | null;
};

const initial: FormState = { error: "" };
const field = "mt-1 w-full rounded border px-3 py-2";

export default function ProfileForm({
  mode,
  profile,
}: {
  mode: "create" | "edit";
  profile?: Profile;
}) {
  const [state, action, pending] = useActionState(
    mode === "create" ? createProfileAction : updateProfileAction,
    initial,
  );
  const [shopName, setShopName] = useState(profile?.shopName ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [pincode, setPincode] = useState(profile?.pincode ?? "");
  const [fssai, setFssai] = useState(profile?.fssaiNumber ?? "");

  return (
    <form action={action} className="space-y-3">
      <label className="block text-sm">
        Dukaan ka naam
        <input
          name="shopName"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          required
          maxLength={80}
          className={field}
        />
      </label>

      <label className="block text-sm">
        Shehar
        <input
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          maxLength={60}
          className={field}
        />
      </label>

      <label className="block text-sm">
        Poora pata
        <textarea
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          minLength={5}
          maxLength={200}
          rows={2}
          className={field}
        />
      </label>

      <label className="block text-sm">
        Pincode (6 digit)
        <input
          name="pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          required
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          className={field}
        />
      </label>

      <label className="block text-sm">
        FSSAI number (14 digit, abhi nahi hai to khali chhodo)
        <input
          name="fssaiNumber"
          value={fssai}
          onChange={(e) => setFssai(e.target.value)}
          inputMode="numeric"
          pattern="\d{14}"
          maxLength={14}
          className={field}
        />
      </label>

      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.saved && !state.error && <p className="text-green-600">Save ho gaya.</p>}

      <button disabled={pending} className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Ruko..." : mode === "create" ? "Dukaan ki profile banao" : "Save karo"}
      </button>
    </form>
  );
}
```

#### menu/item-form.tsx

```tsx
"use client";

import { useActionState, useState } from "react";
import { createMenuItemAction, updateMenuItemAction, type FormState } from "../actions";
import { DAY_NAMES, paiseToRupees, type DashMenuItem } from "@/lib/provider";

const initial: FormState = { error: "" };
const field = "mt-1 w-full rounded border px-3 py-2";

export default function ItemForm({ item }: { item?: DashMenuItem }) {
  const editing = Boolean(item);
  const [state, action, pending] = useActionState(
    editing ? updateMenuItemAction : createMenuItemAction,
    initial,
  );

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? paiseToRupees(item.pricePaise) : "");
  const [day, setDay] = useState(item?.dayOfWeek == null ? "" : String(item.dayOfWeek));
  const [isVeg, setIsVeg] = useState(item?.isVeg ?? true);
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);

  return (
    <form action={action} className="space-y-3 rounded border p-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      <label className="block text-sm">
        Dish ka naam
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={80}
          className={field}
        />
      </label>

      <label className="block text-sm">
        Kya-kya hai (optional)
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={2}
          className={field}
        />
      </label>

      <label className="block text-sm">
        Daam (rupaye me, jaise 85 ya 85.50)
        <input
          name="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          inputMode="decimal"
          className={field}
        />
      </label>

      <label className="block text-sm">
        Kis din
        <select name="dayOfWeek" value={day} onChange={(e) => setDay(e.target.value)} className={field}>
          <option value="">Har din</option>
          {DAY_NAMES.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isVeg"
          checked={isVeg}
          onChange={(e) => setIsVeg(e.target.checked)}
        />
        Veg hai
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isAvailable"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
        />
        Chalu hai (customers ko dikhe)
      </label>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button disabled={pending} className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Ruko..." : editing ? "Save karo" : "Item jodo"}
      </button>
    </form>
  );
}
```

#### menu/page.tsx

```tsx
import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import { DAY_NAMES, type DashMenuItem } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import DashNav from "@/components/dash-nav";
import ConfirmButton from "@/components/confirm-button";
import ItemForm from "./item-form";
import { deleteMenuItemAction, toggleAvailableAction } from "../actions";

const small = "rounded border px-3 py-1 text-sm hover:bg-orange-50";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; added?: string; notice?: string }>;
}) {
  const { edit, added, notice } = await searchParams;

  await requireProviderUser("/dashboard/menu");

  const res = await providerFetch("/providers/me/menu", {
    mode: "page",
    returnTo: "/dashboard/menu",
  });
  const items = res.ok ? ((await res.json()) as DashMenuItem[]) : null;
  const editItem = edit && items ? items.find((i) => String(i.id) === edit) : undefined;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <DashNav active="menu" />

      <h1 className="mt-6 text-2xl font-bold">Mera menu</h1>
      <p className="mt-1 text-sm text-gray-600">
        Customers ko sirf aaj ka menu dikhta hai: jis item ka din aaj ka ya &quot;Har din&quot; ho aur
        jo chalu ho.
      </p>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {added && !editItem && (
        <p className="mt-4 rounded border border-green-600 p-3 text-green-600">Item jud gaya.</p>
      )}

      <h2 className="mt-6 text-lg font-semibold">{editItem ? "Item badlo" : "Naya item jodo"}</h2>
      <div className="mt-2">
        <ItemForm
          key={editItem ? `edit-${editItem.id}` : `new-${added ?? ""}`}
          item={editItem}
        />
        {editItem && (
          <p className="mt-2">
            <Link href="/dashboard/menu" className="text-orange-600">
              Rehne do
            </Link>
          </p>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Saare items</h2>

      {!items && <p className="mt-4 text-red-600">Menu nahi la paye, baad me try karo.</p>}
      {items && items.length === 0 && (
        <p className="mt-4 text-gray-600">Abhi koi item nahi hai. Upar se pehla item jodo.</p>
      )}

      {items && items.length > 0 && (
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
                  <p className="mt-1 text-sm text-gray-600">
                    {item.dayOfWeek === null ? "Har din" : DAY_NAMES[item.dayOfWeek]} -{" "}
                    {item.isAvailable ? "Chalu" : "Band"}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.pricePaise)}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={toggleAvailableAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="available" value={String(!item.isAvailable)} />
                  <button className={small}>{item.isAvailable ? "Band karo" : "Chalu karo"}</button>
                </form>

                <Link href={`/dashboard/menu?edit=${item.id}`} className={small}>
                  Badlo
                </Link>

                <form action={deleteMenuItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton
                    message="Ye item hata dein?"
                    className="rounded border border-red-600 px-3 py-1 text-sm text-red-600"
                  >
                    Hatao
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

#### orders/page.tsx

```tsx
import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import {
  ACTION_LABEL,
  FILTERS,
  NEXT_STATUSES,
  PROVIDER_STATUS_LABEL,
  type ProviderOrder,
} from "@/lib/provider";
import type { OrderStatus } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";
import DashNav from "@/components/dash-nav";
import AutoRefresh from "@/components/auto-refresh";
import ConfirmButton from "@/components/confirm-button";
import { updateOrderStatusAction } from "../actions";

const LIMIT = 20;

function pathFor(status: string, page: number) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (page > 1) q.set("page", String(page));
  const qs = q.toString();
  return qs ? `/dashboard/orders?${qs}` : "/dashboard/orders";
}

export default async function ProviderOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; notice?: string }>;
}) {
  const { status: statusParam, page: pageParam, notice } = await searchParams;

  const status: OrderStatus | "" = FILTERS.some((f) => f.value !== "" && f.value === statusParam)
    ? (statusParam as OrderStatus)
    : "";
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const here = pathFor(status, page);

  await requireProviderUser(here);

  const q = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (status) q.set("status", status);

  const res = await providerFetch(`/providers/me/orders?${q.toString()}`, {
    mode: "page",
    returnTo: here,
  });
  const data = res.ok ? ((await res.json()) as { items: ProviderOrder[]; total: number }) : null;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <AutoRefresh seconds={30} />
      <DashNav active="orders" />

      <h1 className="mt-6 text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-gray-600">Ye page har 30 second me apne aap naye orders la leta hai.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value || "all"}
            href={pathFor(f.value, 1)}
            className={
              f.value === status
                ? "rounded bg-orange-600 px-3 py-1 text-sm text-white"
                : "rounded border px-3 py-1 text-sm hover:bg-orange-50"
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {!data && <p className="mt-4 text-red-600">Orders nahi la paye, baad me try karo.</p>}
      {data && data.items.length === 0 && (
        <p className="mt-4 text-gray-600">Is filter me koi order nahi hai.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((o) => {
            const next = NEXT_STATUSES[o.status] ?? [];
            return (
              <li key={o.id} className="rounded border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Order #{o.id}</p>
                    <p className="text-sm text-gray-600">{formatDate(o.createdAt)}</p>
                  </div>
                  <p className="rounded border px-2 py-1 text-sm font-semibold">
                    {PROVIDER_STATUS_LABEL[o.status]}
                  </p>
                </div>

                <div className="mt-3 text-sm">
                  <p>
                    Customer:{" "}
                    <a href={`tel:${o.user.phone}`} className="text-orange-600">
                      {o.user.phone}
                    </a>
                  </p>
                  <p className="mt-1">Delivery ka pata: {o.deliveryAddress}</p>
                  {o.note && <p className="mt-1">Note: {o.note}</p>}
                </div>

                <ul className="mt-3 space-y-1">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-4 text-sm">
                      <span>
                        {it.name} x {it.quantity}
                      </span>
                      <span>{formatPrice(it.pricePaise * it.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 flex justify-between border-t pt-2 font-semibold">
                  <span>Total (COD, customer se cash lena)</span>
                  <span>{formatPrice(o.totalPaise)}</span>
                </p>

                {next.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {next.map((s) => (
                      <form key={s} action={updateOrderStatusAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="status" value={s} />
                        <input type="hidden" name="back" value={here} />
                        <ConfirmButton
                          message={s === "REJECTED" ? "Ye order mana karna hai?" : undefined}
                          className={
                            s === "REJECTED"
                              ? "rounded border border-red-600 px-3 py-2 text-sm text-red-600"
                              : "rounded bg-orange-600 px-3 py-2 text-sm text-white"
                          }
                        >
                          {ACTION_LABEL[s]}
                        </ConfirmButton>
                      </form>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 flex justify-between">
        {page > 1 ? (
          <Link href={pathFor(status, page - 1)} className="text-orange-600">
            &larr; Naye orders
          </Link>
        ) : (
          <span />
        )}
        {data && data.total > page * LIMIT && (
          <Link href={pathFor(status, page + 1)} className="text-orange-600">
            Aur purane orders &rarr;
          </Link>
        )}
      </div>
    </main>
  );
}
```

### Website: admin (`web/src/app/admin/`)

#### actions.ts

```ts
"use server";

import { redirect } from "next/navigation";
import { providerFetch } from "@/lib/provider-api";

export async function setProviderStatusAction(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "").trim();
  const status = String(fd.get("status") ?? "").trim();
  const rawBack = String(fd.get("back") ?? "");
  const back = rawBack.startsWith("/admin") ? rawBack : "/admin";

  if (!/^\d{1,10}$/.test(id) || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    redirect(back);
  }

  const res = await providerFetch(`/admin/providers/${id}/status`, {
    mode: "action",
    returnTo: back,
    method: "PATCH",
    body: { status },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const url = new URL(back, "http://local");
    url.searchParams.set("notice", String(data?.error ?? "Kuch gadbad hui").slice(0, 200));
    redirect(url.pathname + url.search);
  }

  redirect(back);
}
```

#### page.tsx

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { providerFetch } from "@/lib/provider-api";
import { formatDate } from "@/lib/format";
import {
  ADMIN_FILTERS,
  PROVIDER_STATUS_TEXT,
  type AdminProvider,
  type AdminStats,
} from "@/lib/admin";
import ConfirmButton from "@/components/confirm-button";
import { setProviderStatusAction } from "./actions";

const LIMIT = 20;

function pathFor(status: string, page: number) {
  const q = new URLSearchParams({ status });
  if (page > 1) q.set("page", String(page));
  return `/admin?${q.toString()}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; notice?: string }>;
}) {
  const { status: statusParam, page: pageParam, notice } = await searchParams;

  const status = ADMIN_FILTERS.some((f) => f.value === statusParam) ? (statusParam as string) : "PENDING";
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const here = pathFor(status, page);

  const user = await getCurrentUser(here);
  if (!user) redirect(`/login?next=${encodeURIComponent(here)}`);
  if (user.role !== "ADMIN") redirect("/");

  const statsRes = await providerFetch("/admin/stats", { mode: "page", returnTo: here });
  const stats = statsRes.ok ? ((await statsRes.json()) as AdminStats) : null;

  const q = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (status !== "ALL") q.set("status", status);
  const listRes = await providerFetch(`/admin/providers?${q.toString()}`, {
    mode: "page",
    returnTo: here,
  });
  const data = listRes.ok
    ? ((await listRes.json()) as { items: AdminProvider[]; total: number })
    : null;

  const cards: [string, number | string][] = stats
    ? [
        ["Users", stats.users],
        ["Approval ke intezaar", stats.providersPending],
        ["Approved dukaanein", stats.providersApproved],
        ["Reject dukaanein", stats.providersRejected],
        ["Orders (kul)", stats.orders],
        ["Orders (24 ghante)", stats.orders24h],
        ["Pahunche orders", stats.delivered],
      ]
    : [];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; Website
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Admin</h1>

      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded border p-3">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {ADMIN_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={pathFor(f.value, 1)}
            className={
              f.value === status
                ? "rounded bg-orange-600 px-3 py-1 text-sm text-white"
                : "rounded border px-3 py-1 text-sm hover:bg-orange-50"
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {!data && <p className="mt-4 text-red-600">Providers nahi la paye, baad me try karo.</p>}
      {data && data.items.length === 0 && (
        <p className="mt-4 text-gray-600">Is filter me koi dukaan nahi hai.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((p) => (
            <li key={p.id} className="rounded border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{p.shopName}</p>
                  <p className="text-sm text-gray-600">
                    {p.city} - {p.pincode}
                  </p>
                </div>
                <p className="rounded border px-2 py-1 text-sm font-semibold">
                  {PROVIDER_STATUS_TEXT[p.status]}
                </p>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <p>Pata: {p.address}</p>
                <p>FSSAI: {p.fssaiNumber ?? "daala nahi"}</p>
                <p>
                  Malik ka phone:{" "}
                  <a href={`tel:${p.user.phone}`} className="text-orange-600">
                    {p.user.phone}
                  </a>
                </p>
                <p className="text-gray-600">
                  Menu me {p._count.menuItems} item, {p._count.orders} order, bani {formatDate(p.createdAt)}
                  {p.status === "APPROVED" && (p.isOpen ? ", abhi khuli hai" : ", abhi band hai")}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {p.status !== "APPROVED" && (
                  <form action={setProviderStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <input type="hidden" name="back" value={here} />
                    <ConfirmButton className="rounded bg-orange-600 px-3 py-2 text-sm text-white">
                      Approve karo
                    </ConfirmButton>
                  </form>
                )}
                {p.status !== "REJECTED" && (
                  <form action={setProviderStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <input type="hidden" name="back" value={here} />
                    <ConfirmButton
                      message={
                        p.status === "APPROVED"
                          ? "Ye dukaan band ho jayegi aur customers ko nahi dikhegi. Reject karna hai?"
                          : "Ye dukaan reject karni hai?"
                      }
                      className="rounded border border-red-600 px-3 py-2 text-sm text-red-600"
                    >
                      Reject karo
                    </ConfirmButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-between">
        {page > 1 ? (
          <Link href={pathFor(status, page - 1)} className="text-orange-600">
            &larr; Pichla
          </Link>
        ) : (
          <span />
        )}
        {data && data.total > page * LIMIT && (
          <Link href={pathFor(status, page + 1)} className="text-orange-600">
            Agla &rarr;
          </Link>
        )}
      </div>
    </main>
  );
}
```

## 5. Saare API routes (abhi tak, admin ke saath)

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
| `GET /api/v1/admin/stats` | admin | users, providers (pending/approved/rejected), orders (kul, 24 ghante, pahunche) ke count |
| `GET /api/v1/admin/providers` | admin | providers ki list (`?status=PENDING`, `page`, `limit`), malik ka `user.phone` aur `_count` ke saath |
| `PATCH /api/v1/admin/providers/:id/status` | admin | `APPROVED`, `REJECTED` ya `PENDING` karo (approve ke alawa par `isOpen` false ho jata hai) |

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

### Website par login, ab tab ke saath (browser me)

`http://localhost:3000/login` par upar **Customer** aur **Provider** tab dikhte hain. Customer tab: login ke baad home. Provider tab: login ke baad `/start` (PROVIDER ko `/dashboard`, ADMIN ko `/admin`, naye user ko home). Seedha provider ke liye: `http://localhost:3000/login?as=provider`. Role sirf dukaan ki profile banne se badalta hai, tab chunne se nahi. OTP hamesha **backend wale terminal** me print hota hai.

### Admin login (`6666666666`): `$accessA` aur `$refreshA`

Pehle ek baar website par is number se login karo (taaki `User` ban jaye), logout karo, phir `backend` folder me:

```
npx prisma studio
```

`User` table me `6666666666` ki `role` ko `ADMIN` karke Save karo. Studio band karne ke liye `Ctrl + C`. Phir PowerShell me (`ASLI_OTP` ki jagah backend terminal ka 6 digit):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"6666666666"}'
```

```
$rA = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"6666666666","code":"ASLI_OTP"}'
```

```
$accessA = $rA.accessToken
```

```
$refreshA = $rA.refreshToken
```

(Role badalne ke baad naya login karna zaroori hai, nahi to token me purana role `CUSTOMER` hi rahega.)

### Naye provider ka login (`7777777777`)

Website par hi: `http://localhost:3000/login?as=provider`, number `7777777777`, OTP backend terminal se. Pehli baar login par `/dashboard` par "Apni dukaan kholo" ka form aata hai.

## 7. Step 6.6 aur 6.7 ke tests

Teen terminal: backend, website, aur PowerShell tests ke liye. **Har command alag line par, har ke baad Enter.** Naya terminal kholne par `$` variables khali ho jate hain.

### 7.1 Taiyari: server aur code ki jaanch

Terminal 1 (backend):

```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\backend"
```

```
npm run dev
```

Terminal 2 (website):

```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\web"
```

```
npm run dev
```

Naya terminal (code ki jaanch, dono jagah kuch print nahi hona chahiye):

```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\backend"
```

```
npx tsc --noEmit
```

```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\web"
```

```
npx tsc --noEmit
```

Folder check (dashboard ki sab files): `tiffin-ghar` folder se:

```
Get-ChildItem -Recurse -Name web\src\app\dashboard
```

Dikhna chahiye: `actions.ts`, `page.tsx`, `profile-form.tsx`, `menu\item-form.tsx`, `menu\page.tsx`, `orders\page.tsx`.

Do browser rakho: provider/admin ke liye normal window, customer ke liye **Incognito**. OTP hamesha backend terminal me.

### 7.2 Login tab aur role se sahi page

1. `http://localhost:3000/login` kholo. **Customer** tab chuna dikhe. `9999999999` se login karo. Home par aana chahiye.
2. Logout karo. `http://localhost:3000/login?as=provider` kholo, **Provider** tab chuna dikhe. `8888888888` se login karo. Seedha `/dashboard` khule.
3. Logout. Provider tab me `9999999999` se login karo. `/dashboard` par "Apni dukaan kholo" ka form aaye (dukaan nahi banti jab tak form na bharo).
4. Logout. `http://localhost:3000/orders` kholo (`/login?next=%2Forders` par jayega). **Provider** tab dabao, URL me `next=%2Forders` bacha rahe. `8888888888` se login karo, `/orders` par aana chahiye.
5. `http://localhost:3000/start` bina login ke kholo: `/login` par jaye. Login ke baad: customer ko home, provider ko `/dashboard`, admin ko `/admin`.
6. Home par login ke baad "Mere orders", "Dashboard" / "Apni dukaan kholo" / "Admin" aur Logout ek line me dikhein, Logout kaam kare.

### 7.3 Provider dashboard (normal window, `8888888888`)

**A. Dukaan:**
1. `/dashboard`: shop "Sharma Ghar Ka Tiffin", status `APPROVED`. "Dukaan kholo" / "Dukaan band karo" dabao, text "khuli hai" aur "band hai" ke beech badle.
2. "Profile badlo" kholo, shehar ya pata badlo, Save karo: "Save ho gaya". Pincode `12` daalo: browser rokega ya backend ka error aaye.

**B. Menu (`/dashboard/menu`):**
1. Naya item: `Test Thali`, daam `85.50`, "Har din", Veg aur Chalu tick. "Item jodo": "Item jud gaya", list me `₹85.5`, form khali.
2. Daam `abc`: `Daam rupaye me likho...`. Daam `0.5`: backend ka error `Daam kam se kam ₹1 ho`.
3. "Badlo" se daam `90`: Save, list me `₹90`.
4. "Band karo": item customer ko nahi dikhna chahiye. "Chalu karo" se wapas.
5. "Hatao": "pakka?" ka box. Cancel se item rahe, OK se hat jaye. (Test ke baad ek item wapas bana lo, order ke liye chahiye.)

**C. Order poora chakkar (customer Incognito, `9999999999`):**
1. Incognito me `/login` se `9999999999` login. Home par `Prayagraj` dhundo, "Sharma Ghar Ka Tiffin" kholo, band kiya item na dikhe. Quantity badhao, pata likho (kam se kam 10 akshar), order do.
2. Provider window me `/dashboard/orders`: 30 second ruko ya `F5`. Naya order: customer ka phone, pata, items, total.
3. "Accept karo", phir "Ban raha hai", "Raaste me hai", "Pahunch gaya". Har click ke baad status badle aur sahi buttons dikhein. Har status ke baad customer ke order page par `F5` karo.
4. Naya order do. "Mana karo" par "pakka?" ka box, OK: "Mana kiya". Filter "Mana kiye" me dikhe.
5. Naya order do, customer se cancel karwao. Provider page par `F5`: "Customer ne cancel kiya", koi button nahi.
6. Race test (optional): order do, provider ka orders page khula rehne do, customer se cancel karo, phir provider ke purane button par "Accept karo" dabao. Upar laal message aaye (`Order abhi CANCELLED hai...`).

**D. Naya provider (`7777777777`) aur role badalna:**
1. Logout, `/login?as=provider` se `7777777777` login. `/dashboard` par form.
2. Shehar `Prayagraj`, pincode `211001`, baaki bharo, "Dukaan ki profile banao". Seedha dashboard, "Approval ka intezaar", dukaan kholne ka button **nahi**.
3. Turant `/dashboard/menu` kholo: page khule (403 ya login par wapas nahi). Ek item jodo. (Yahi role badalne ka asli test hai.)
4. Admin se approve karwao (7.4 ya Prisma Studio: `Provider` table me `status` `APPROVED`). `/dashboard` par `F5`: "Dukaan kholo" button, dabao. Incognito me `Prayagraj` dhundo, nayi dukaan dikhe.

**E. Customer dashboard me ghuse to (Incognito, `9999999999`):**
1. `/dashboard/menu` kholo: `/dashboard` par bhej de, "Apni dukaan kholo" ka form.
2. `/dashboard/orders` bhi wahi kare.
3. Logout karke `/dashboard`: `/login` par jaye.

### 7.4 Admin panel (Step 6.7)

**A. Admin banana:** section 6 ke "Admin login" wale commands (Prisma Studio me `6666666666` ko `ADMIN` karo, phir login, `$accessA`).

**B. Admin ke backend routes (PowerShell):**

Stats (aana chahiye `users`, `providersPending`, `orders` wagairah):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/admin/stats -Headers @{ Authorization = "Bearer $accessA" }
```

Sab providers:

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/admin/providers -Headers @{ Authorization = "Bearer $accessA" }
```

Sirf pending:

```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/providers?status=PENDING" -Headers @{ Authorization = "Bearer $accessA" }
```

Galat status (aana chahiye `Status galat hai`):

```
try { Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/providers?status=KUCH" -Headers @{ Authorization = "Bearer $accessA" } } catch { $_.ErrorDetails.Message }
```

Status badalna (provider `id` 2 maano, jo `7777777777` ki dukaan ho):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/admin/providers/2/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $accessA" } -Body '{"status":"APPROVED"}'
```

Galat id (aana chahiye `Provider nahi mila`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/admin/providers/9999/status -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $accessA" } -Body '{"status":"APPROVED"}' } catch { $_.ErrorDetails.Message }
```

Customer ka token admin route nahi khol sakta (`$access2` customer login se, section 6; aana chahiye `Aapko ye karne ki ijazat nahi hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/admin/stats -Headers @{ Authorization = "Bearer $access2" } } catch { $_.ErrorDetails.Message }
```

Bina token ke:

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/admin/stats } catch { $_.ErrorDetails.Message }
```

**C. Admin panel (browser):**
1. `6666666666` se login (Customer ya Provider tab, dono chalenge). Home par "Admin" link ya `/start` se `/admin` khule.
2. Upar stats ke dabbe, filter "Approval ke intezaar" chuna.
3. `7777777777` ki nayi dukaan "Approval ke intezaar" me dikhe: phone, pata, menu ke items.
4. "Approve karo": "pakka?" ka box, OK. Dukaan "Approved" me chali jaye. `7777777777` ke dashboard par `F5`: "Dukaan kholo" ka button.
5. "Reject karo": dashboard par `F5`: "approve nahi hui", customer ko dukaan na dikhe (khuli thi to band ho gayi).
6. Wapas "Approve karo".
7. Customer account (`9999999999`) se `/admin` kholo: home par wapas aa jaye.

### 7.5 Order ka live status (Step 6.7)

1. Provider window me `/dashboard/orders` kholo. Customer (Incognito) se naya order do.
2. Customer ke order page par bina `F5` kiye ruko. Provider "Accept karo" dabaye: 15 second ke andar customer ke page par status badle. Aise hi "Ban raha hai", "Raaste me hai", "Pahunch gaya". Pahunch gaya ke baad page me aur refresh nahi hona chahiye.

### 7.6 Aam jaankari (jo tests me dikha)

- Orders page par tab bahut der khula chhoda ho to access token (14 minute) ke khatam hone par page ek baar apne aap reload ho sakta hai. Normal hai.
- FSSAI ek baar daalne ke baad khali karke hata nahi sakte (backend ka validator khali nahi maanta), badal sakte ho.

### 7.7 Git

`tiffin-ghar` folder se:

```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar"
```

```
git status --short
```

`.env`, `.env.local`, `node_modules`, `.next` nahi dikhna chahiye. Phir:

```
git add .
```

```
git commit -m "Step 6.6 and 6.7: provider dashboard, login tabs, admin panel, live order status"
```

```
git push
```

```
git log --oneline -5
```

Secrets check (list me `.env` ya `.env.local` nahi dikhna chahiye):

```
git ls-files | findstr env
```

## 8. Step 6 ke purane tests (6.1 se 6.5)

### 8.1 Step 6.1: tables ban gayi?

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

### 8.2 Step 6.2: order dena (customer)

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

### 8.3 Step 6.3: mere orders dekho aur cancel karo (customer)

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

### 8.4 Step 6.4: provider orders aur status

**Taiyari: naya `PLACED` order** (8.2 A ki `$body`, `$o`, `$oid` commands). Purana `CANCELLED` order status test ke kaam ka nahi.

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

### 8.5 Step 6.5: website par order (Chrome me)

Backend (`backend` folder me) aur website (`web` folder me) dono `npm run dev` se chalte hon. Naye folder ya file banane par server na pakde to `Ctrl + C` karke `npm run dev` dobara chalao.

1. **Bina login:** `http://localhost:3000/provider/1`. Menu dikhna chahiye, `+` `-` buttons nahi, aur neeche `Order dene ke liye pehle login karo`.
2. **Login:** customer number se login karo, OTP backend terminal me dekho.
3. **Order do:** menu par kisi item ke `+` dabao, neeche `Aapka order` me total badlega. Delivery ka pata likho (kam se kam 10 akshar), **Order karo** dabao.
4. **Order page:** `/orders/<id>` par `Order mil gaya, dukaan ke jawab ka intezaar`, items, total, pata, aur **Order cancel karo** button.
5. **Mere orders:** `http://localhost:3000/orders`. Naya order sabse upar.
6. **Status badalna:** PowerShell se (8.4 G) order ko `ACCEPTED` karo, website par `F5`. `Dukaan ne accept kar liya` dikhna chahiye aur cancel button hat jana chahiye.
7. **Cancel:** naya order do, **Order cancel karo** dabao. `Cancel ho gaya` dikhna chahiye.
8. **Provider apni dukaan se:** `8888888888` se login karke us dukaan ka order do. `Aap apni hi dukaan se order nahi kar sakte` laal rang me aana chahiye.
9. **Khali ya chhota pata:** 10 akshar se chhota ho to browser khud rok dega.
10. **Cookie expire:** `F12`, **Application**, **Cookies**, `tg_access` delete karo, phir order do. Order ban jana chahiye (server action khud naya token le leta hai).

### 8.6 Git

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

## 9. Purane tests (Step 1 se 5.2)

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



## 10. Jo galtiyan hui aur unke hal (Step 6.6 aur 6.7)

Purani galtiyan `tiffin-ghar-project-notes-step6.md` ke section 9 aur `tiffin-ghar-project-notes-step5.md` ke section 8 me hain.

- **`/start` par "The default export is not a React Component":** page me har raaste par `redirect()` tha aur kuch return nahi hota tha, to Next.js use component nahi maanta. Fix: ek target tay karo, `redirect(target)`, aur uske baad `return <p>Ruko...</p>;` (upar code me hai).
- **`actions.ts` me `Type 'string | undefined' is not assignable to type 'string'` (menu ke actions):** `readMenuForm` ke do alag shape (`{error}` aur `{body}`) TypeScript pehchan nahi paya. Fix: saaf return type `MenuForm = { error: string; body: null } | { error: null; body: MenuBody }` aur check `if (!parsed.body) return { error: parsed.error };` (upar code me hai).
- **`Cannot find module './profile-form'`:** `profile-form.tsx` file `web/src/app/dashboard/` me nahi thi (ya naam galat tha). `Get-ChildItem -Recurse -Name web\src\app\dashboard` se check karo.
- **`orders/[id]/page.tsx` me TS2448 "Block-scoped variable 'order' used before its declaration":** `AutoRefresh` wali lines "Ye order nahi mila" wale `main` me laga di thi, jahan `order` abhi bana nahi hota. Wo lines sirf `const order = ...` ke baad wale `return (` ke andar, order wale `<main>` ki agli line me honi chahiye.
- **React 19 me form action ke baad uncontrolled fields khali ho jate hain** (error aane par likha hua mit jata). Isliye dashboard ke saare forms ke fields `useState` se controlled hain.
- **Profile banate hi `/dashboard/menu` 403 de sakta hai** (token me purana role). `createProfileAction` me `refreshInline()` hai aur `providerFetch` 403 par khud refresh karta hai. Pages me pehle `/me` se role dekhte hain, taaki refresh ka loop na bane.
- **Login ke baad role se sahi page:** login ka default `next` `/` hota hai. Provider tab usse `/start` bana deta hai. Seedha `/login` khologe to Customer tab, home par aaoge.
- **`dashboard/page.tsx` me ADMIN ka message:** is notes ke code me ab `/admin` ka link hai (purane version me "Step 9 me banega" likha tha). Dono chalte hain.
- **Admin ka role badalne ke baad naya login zaroori:** purane token me `CUSTOMER` hi rehta hai, `/admin` 403 deta hai.
- **VS Code me `globals.css` par `Unknown at rule @theme` warning:** Tailwind v4 ka normal syntax, ignore karo.

## 11. Agla aur bachi hui cheezein

### Kitna bacha hai

| Step | Kaam |
|---|---|
| 6.6, 6.7 | Provider dashboard, login tab, admin panel, order live status. **Ho gaye.** |
| **Batch C (agla)** | **Rating aur review** (customer pahunche order par dukaan ko 1 se 5 star aur chhota review; dukaan ki average rating home aur dukaan ke page par), saath me **photo upload ki taiyari** (database me dukaan aur dish ki photo ke fields, ek hi migration me). Ek hi batch me. |
| Design step | Rang, hero banner, logo, font, mobile par achha dikhna, dukaan aur dish ki photos dikhana (photo upload yahin poora). Pasand ki 2-3 websites ka dhyan rakho. |
| Bhasha step | Website ka text files me (Hindi, English; user chunega), `User.language`, backend error ke saath `code`. Mobile app se **pehle**. |
| 7 | Mobile app (React Native), website jaisa brand, bhasha ke text wahi files se. Backend wahi rahega. |
| 8 | Subscription (monthly meals), wallet, payment (Razorpay). |
| 9 | Live tracking, notifications, complaints, admin ke aur kaam. |

### Zaroori baatein

- `npm audit fix --force` mat chalana.
- `.env`, `.env.local`, database password, `JWT_SECRET`, access aur refresh token kisi ko mat bhejo, chat ya screenshot me bhi nahi.
- Hamesha `tiffin-ghar` folder se commit karo, `backend` ya `web` ke andar se nahi.
- Naya Prisma model ya migration ke baad `npx prisma generate` aur VS Code me `TypeScript: Restart TS Server`.
- Approval ab admin panel se hota hai (`/admin`). Admin banane ke liye Prisma Studio me `User.role` `ADMIN`.
- Provider ka role badalne ke baad naya token (refresh) zaroori hai (website me apne aap hota hai).
- Live se pehle: backend me asli customer ka IP (`trust proxy`, `X-Forwarded-For`), `cors()` me sirf apni website, asli SMS (DLT), hosting, domain, database backup, FSSAI check, wallet aur payment ka expert review, rate limit Redis me. Purane expire hue refresh tokens saaf karne ka job.
- Har naye kaam se pehle `git commit`.

### Test accounts

- `9999999999`: customer.
- `8888888888`: provider ("Sharma Ghar Ka Tiffin", Prayagraj, 211001, provider `id` 1, `APPROVED`).
- `7777777777`: naya provider (dashboard se profile banane ka test).
- `6666666666`: admin (`User.role` `ADMIN`).
- OTP abhi SMS se nahi, backend wale terminal me print hota hai.

## 12. Files jinka code is notes me nahi hai

Ye files tumhari machine par hain par code in notes me nahi: `web/src/app/login/LoginForm.tsx` aur `web/src/app/session/refresh/route.ts`. Naye chat ko zaroorat padne par `tiffin-ghar` folder se (har command alag line par):

```
Get-ChildItem -Recurse -Name web\src\app
```

```
Get-Content web\src\app\login\LoginForm.tsx
```

```
Get-Content web\src\app\session\refresh\route.ts
```

## 13. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, Next.js website, baad me React Native mobile app). Is app ka startup bhi karna hai, to ise professional banana hai. Chhe notes files attach ki hain (`tiffin-ghar-project-notes-step3.md`, `tiffin-ghar-project-notes-step3-5-1.md`, `tiffin-ghar-project-notes-step4.md`, `tiffin-ghar-project-notes-step5.md`, `tiffin-ghar-project-notes-step6.md` aur `tiffin-ghar-project-notes-step7.md`). Step 1 se 6.7 poore ho gaye (phone OTP login, JWT, refresh token, provider profile aur menu, website par customer login aur Customer/Provider tab, order banana, mere orders, cancel, provider ke orders aur status, provider ka dashboard website par, admin panel, order ka live status). Mene [git commit aur push kar diya hai / ye abhi baki hai]. Ab Batch C se shuru karna hai: rating aur review, saath me photo upload ki taiyari (database me photo ke fields). Uske baad design step, phir bhasha chunne wala step (Hindi/English), phir mobile app. Mujhe jo bhi kaam kai steps me ek saath ho sakta hai wo ek saath (batch me) do, taaki bar-bar wahi code na badalna pade, par tabhi jab usse kuch toote nahi. Hinglish me step by step samjhao, har file kis folder me banani hai ye saaf batao, ek-ek command alag line me do, aur jahan files banane ke baad kuch test karna ho, saari commands aur browser ke steps likh kar do. Notes files me hamesha saari commands (login aur har test command) rakhna.
