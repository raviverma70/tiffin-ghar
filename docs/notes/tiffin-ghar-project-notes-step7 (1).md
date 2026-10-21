# Tiffin Ghar: Notes (Step 6.6 provider dashboard, login tabs, Step 6.7 admin panel, Batch C rating aur review, Design step, Bhasha step: poora code aur saari test commands)

Ye file in paanch files ke **saath** use karni hai: `tiffin-ghar-project-notes-step3.md`, `tiffin-ghar-project-notes-step3-5-1.md`, `tiffin-ghar-project-notes-step4.md`, `tiffin-ghar-project-notes-step5.md` aur `tiffin-ghar-project-notes-step6.md`. Un files me Step 1 se 6.5 ka code hai. Is file me wo sab hai jo uske baad hua: provider ka dashboard (6.6), login par Customer/Provider tab, admin panel aur order ka live status (6.7), phir Batch C (rating aur review), Design step (naya look, photo upload) aur Bhasha step (Hinglish, हिन्दी, English). Saari commands (login samet, backend ke saare tests, website ke browser tests, git) is file me hain. **Naye chat me chhe files attach karo.** Dhyan: section 4 ke kuch pages/components (login, home, dashboard, orders, header waghera) ke **final versions section 13 me hain** (bhasha wale), section 4 me unke pehle ke versions hain.


## 1. Abhi kahan hain

- Step 1 se 6.5: ho gaye, test pass, push hue (`tiffin-ghar-project-notes-step6.md` me details).
- **Step 6.6** (provider dashboard), **login par Customer / Provider tab**, **Step 6.7** (admin panel, order ka live status): ho gaye, test pass.
- **Batch C** (rating aur review, photo ke database fields): ho gaya, test pass. Section 11.
- **Design step** (naya look, header/footer, dukaan aur dish ki photo upload): ho gaya, test pass. Section 12.
- **Bhasha step** (Hinglish, हिन्दी, English, `User.language`): ho gaya, test pass. Section 13.
- Sab tumne ek-ek karke commit aur push kiya. Naye chat ke shuru me `tiffin-ghar` folder se `git status --short` chalao, kuch dikhe to section 14.7 ke commands.
- **Agla: Mobile app (React Native, Expo).** Section 15.

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

### Bhasha (language)
- Ho gaya (section 13): Hinglish (default), हिन्दी, English. User chunta hai, cookie aur database dono me yaad rehta hai. Admin panel sirf Hinglish. Nayi bhasha ya naya text jodne ka tareeka section 13 me.

### Reviews aur photo ke faisle
- Ek order par ek hi review, baad me badalna ya hatana nahi. Review sirf `DELIVERED` order par, sirf us customer ka. Dukaan par `ratingSum` aur `ratingCount` (review ke saath ek hi transaction me).
- Photos abhi backend ki disk par (`backend/uploads`, GitHub par nahi), database me sirf path. Live se pehle cloud storage.

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

### Naye files (Batch C, Design, Bhasha)

```
tiffin-ghar/
  backend/
    uploads/                         * photos (GitHub par nahi jati)
    lib/uploads.ts                   * UPLOAD_DIR
    routes/reviews.ts                * review dena, dukaan ke reviews
    routes/photos.ts                 * dukaan aur dish ki photo upload/hatana
    routes/me.ts                     * PATCH /me/language
    routes/publicProviders.ts        ~ rating, ratingCount, photoUrl
    validators/review.ts             * createReviewSchema, listReviewsQuery
    app.ts                           ~ reviewsRouter, photosRouter, meRouter, /uploads
  web/src/
    i18n/                            * config, translate, server, client, actions, sync, errors
      messages/                      * hinglish.ts, hi.ts, en.ts, index.ts
    app/
      layout.tsx                     ~ fonts, I18nProvider, header, footer
      globals.css, icon.svg          ~ / *
      provider/[id]/reviews/page.tsx * dukaan ke reviews (public)
      orders/[id]/review-form.tsx    * review dena
      dashboard/reviews/page.tsx     * provider ke reviews
    components/
      logo, thumb, site-header, site-footer, language-switcher, photo-uploader, stars   *
    lib/
      reviews.ts, photo.ts, upload.ts, format.ts   *
```

## 4. Code

> **Dhyan:** Design aur Bhasha step me kuch Step 6.6 / 6.7 ki files badal gayi. Unke **final versions section 13 me hain** aur purane versions yahan se hata diye gaye hain.

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

`lib/provider.ts` ka final code section 13 me hai.

#### web/src/lib/authed.ts me ek shabd badlo

`async function refreshInline()` ke aage `export` lagao, baaki kuch nahi badalna:

```ts
export async function refreshInline(): Promise<string | null> {
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

`dash-nav.tsx` aur `dashboard-link.tsx` ka final code section 13 me hai. `auto-refresh.tsx` aur `confirm-button.tsx` yahan hain.

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

Login (`page.tsx`, `LoginForm.tsx`, `actions.ts`), home `page.tsx` aur `orders/[id]/page.tsx` ka **final code section 13 me hai**. `start/page.tsx` yahan hai.

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

### Website: dashboard (`web/src/app/dashboard/`)

Dashboard ke saare files (`actions.ts`, `page.tsx`, `profile-form.tsx`, `menu/page.tsx`, `menu/item-form.tsx`, `orders/page.tsx`, `reviews/page.tsx`) ka **final code section 13 me hai** (Step 6.6 wale purane versions yahan se hata diye).

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
| `POST /api/v1/orders/:id/review` | login (apna `DELIVERED` order) | `rating` 1 se 5 aur `comment`. Ek order par ek hi (dobara par 409) |
| `GET /api/v1/providers/:id/reviews` | public | dukaan ke reviews (`APPROVED` dukaan), `provider.rating`, `ratingCount`, `page`, `limit` |
| `POST /api/v1/providers/me/photo` | provider | dukaan ki photo (raw JPG/PNG/WebP body, 2 MB tak) |
| `DELETE /api/v1/providers/me/photo` | provider | dukaan ki photo hatao |
| `POST /api/v1/providers/me/menu/:id/photo` | provider | dish ki photo |
| `DELETE /api/v1/providers/me/menu/:id/photo` | provider | dish ki photo hatao |
| `PATCH /api/v1/me/language` | login | `hinglish`, `hi` ya `en` |
| `GET /uploads/<naam>` | public | upload ki hui photo (static, `Cross-Origin-Resource-Policy: cross-origin`) |

(Public list aur menu me ab `rating`, `ratingCount`, `photoUrl` bhi aate hain. `GET /api/v1/orders` aur `/orders/:id` me `review` bhi.)

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

## 10. Jo galtiyan hui aur unke hal (Step 6.6 se Bhasha step tak)

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
- **PowerShell me `$pid` naam ka variable nahi bana sakte:** `Cannot overwrite variable PID because it is read-only or constant`. Wo PowerShell ka apna process ID hai. Dukaan ki id ke liye `$provId`. `$pid` mil jaye to `Dukaan nahi mili` jaisa galat jawab bhi aata hai (process number chala jata hai).
- **PowerShell me path me space (`Ravi Kumar patel`) ho to:** `C:\Users\Ravi : The term 'C:\Users\Ravi' is not recognized`. Sirf path likhne par PowerShell use program samajhta hai. Poori command likho aur path **double quotes** me (`-InFile "C:\Users\Ravi Kumar patel\Pictures\test.jpg"`).
- **Upload ki hui photo `http://localhost:5000/uploads/test.jpg` par `Ye route nahi mila`:** server photo ko random naam (`uuid.jpg`) se save karta hai. Asli naam upload ke jawab ke `photoUrl` me hota hai, ya `Get-ChildItem backend\uploads` se.
- **`Cannot find module '@/components/site-header'` jaise error naye bane files par:** VS Code ki purani list hoti hai. `Ctrl + Shift + P`, `TypeScript: Restart TS Server`. Asli jaanch `npx tsc --noEmit` hai. Phir bhi aaye to file ka naam aur folder (`web/src/components`) dekho, aur file khali to nahi.
- **Zip se files ek saath lagana:** `Expand-Archive -Path "$env:USERPROFILE\Downloads\tiffin-bhasha-step.zip" -DestinationPath "C:\Users\Ravi Kumar patel\tiffin-ghar" -Force` (zip ke andar `web\...` aur `backend\...` folder hain). Pehle `git status --short` saaf ho, taaki kuch bigade to `git checkout .` se wapas aa sako. Zip ke baad manual badlav: `schema.prisma` me `language`, migration, `app.ts` me `meRouter`.
- **Claude ke sandbox me chalti commands:** chat me "Ran a command" jo dikhta hai wo Claude ki apni temporary machine par files banane ke liye hai, tumhare computer par nahi chalti.

## 11. Batch C: rating aur review, photo ke fields (code)

### Kya banta hai
- Customer sirf apne `DELIVERED` order par review de sakta hai (1 se 5 star + comment, 500 akshar tak). **Ek order par ek hi review**, baad me badal ya hata nahi sakte.
- Dukaan par `ratingSum` aur `ratingCount` save hote hain (review ke saath **ek hi transaction me**), average API me nikalta hai (ek decimal tak). `ratingSum` bahar nahi jata.
- Public list aur menu route me ab `rating`, `ratingCount`, `photoUrl` aate hain.
- Naya public route `GET /api/v1/providers/:id/reviews` (dukaan band ho tab bhi, sirf `APPROVED` dukaan). Customer ka phone chhupa kar (`99xxxxxx99`).
- Dukaan aur dish ke `photoUrl` ke fields (upload Design step me).
- Website ke pages (review form, order page, reviews pages, dashboard ka reviews tab) ka **final code section 13 (Bhasha step) me hai**, kyunki wahan unke bhasha wale versions hain.

### backend/prisma/schema.prisma

`model User` me:

```prisma
  reviews       Review[]
```

`model Provider` me:

```prisma
  photoUrl    String?
  ratingSum   Int            @default(0)
  ratingCount Int            @default(0)
  reviews     Review[]
```

`model MenuItem` me:

```prisma
  photoUrl    String?
```

`model Order` me:

```prisma
  review          Review?
```

Sabse neeche naya model:

```prisma
model Review {
  id         Int      @id @default(autoincrement())
  orderId    Int      @unique
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  userId     Int
  user       User     @relation(fields: [userId], references: [id])
  providerId Int
  provider   Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  rating     Int
  comment    String?
  createdAt  DateTime @default(now())

  @@index([providerId, createdAt])
}
```

Migration (backend server band karke, `backend` folder me):

```
npx prisma migrate dev --name add_reviews_and_photos
```

```
npx prisma generate
```

### backend/validators/review.ts (naya)

```ts
import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number("Rating 1 se 5 ke beech chuno")
    .int("Rating 1 se 5 ke beech chuno")
    .min(1, "Rating 1 se 5 ke beech chuno")
    .max(5, "Rating 1 se 5 ke beech chuno"),
  comment: z.string().trim().max(500, "Review 500 akshar se chhota rakho").optional(),
});

export const listReviewsQuery = z.object({
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

Sabse neeche ye line jodo (aur Design step me `uploadLimiter` wali, section 12):

```ts
export const reviewLimiter = make(15 * 60_000, 20, "Bahut zyada reviews, thodi der baad try karo");
```

### backend/routes/reviews.ts (naya)

```ts
import { Router } from "express";
import type { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { publicLimiter, reviewLimiter } from "../middleware/rateLimit.js";
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

export default router;
```

### backend/routes/publicProviders.ts (poori file)

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
  photoUrl: true,
  ratingSum: true,
  ratingCount: true,
};

// ratingSum bahar nahi bhejte, average (ek decimal tak) bhejte hain
function withRating<T extends { ratingSum: number; ratingCount: number }>(p: T) {
  const { ratingSum, ratingCount, ...rest } = p;
  return {
    ...rest,
    ratingCount,
    rating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
  };
}

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

    res.json({ items: items.map(withRating), total, page, limit });
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
        photoUrl: true,
      },
      orderBy: { id: "asc" },
    });

    res.json({ provider: withRating(provider), day: today, items });
  } catch (e) {
    next(e);
  }
});

export default router;
```

### backend/routes/orders.ts: ek line

`const orderInclude = {` ke andar (customer wale router me, `providerOrders.ts` wale me nahi):

```ts
  review: { select: { rating: true, comment: true } },
```

### backend/app.ts

Upar imports me:

```ts
import reviewsRouter from "./routes/reviews.js";
```

`api.use("/orders", ordersRouter);` ke neeche:

```ts
api.use(reviewsRouter);
```

### web/src/lib/api.ts me types

`export type Provider = {` me:

```ts
  photoUrl: string | null;
  rating: number | null;
  ratingCount: number;
```

`export type MenuItem = {` me:

```ts
  photoUrl: string | null;
```

### web/src/lib/reviews.ts (naya)

```ts
import { API_URL } from "@/lib/api";

export type ReviewItem = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: string;
};

export type ReviewsPage = {
  provider: { id: number; shopName: string; rating: number | null; ratingCount: number };
  items: ReviewItem[];
  total: number;
  page: number;
  limit: number;
};

// Dukaan na mili (ya approve na ho) to null
export async function getReviews(id: string | number, page = 1, limit = 20): Promise<ReviewsPage | null> {
  try {
    const res = await fetch(
      `${API_URL}/providers/${encodeURIComponent(String(id))}/reviews?page=${page}&limit=${limit}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as ReviewsPage;
  } catch {
    return null;
  }
}
```

## 12. Design step: naya look, photo upload (code)

### Kya banta hai
- Naya look: warm background (`#fffaf5`, light theme pakka), Poppins font (Hindi ke liye Noto Sans Devanagari taiyar), logo, sticky header aur footer har page par (layout se), home par hero, shehar ke chips, photo-card, "kaise kaam karta hai" aur "dukaan kholo" ka band.
- **Photo upload** (dukaan aur dish ki): provider dashboard me. Browser me hi badi photo 1200px ke JPG me chhoti (`<= 850 KB`), server action `uploadPhotoAction` se Next.js ke zariye backend ko raw bytes jate hain (Next.js ki Server Action ki default limit 1 MB hai, isliye pehle chhota karte hain). Backend `express.raw` se 2 MB tak leta hai, **asli file ke shuru ke bytes (magic bytes)** se JPG/PNG/WebP pehchanta hai (naam ya content-type par bharosa nahi), random naam (`uuid.jpg`) se `backend/uploads/` me save karta hai, purani photo hata deta hai.
- Database me sirf path (`/uploads/<naam>`), website `photoSrc()` se poora link banati hai. **Abhi photos backend ki disk par hain. Live karne se pehle cloud storage (S3/Cloudinary jaisa) par le jana hai, kyunki hosting ki disk mita di jati hai.** Database me sirf path hone ki wajah se baad me badalna aasan hai.
- `/uploads` ko helmet ka `Cross-Origin-Resource-Policy: same-origin` rok deta hai (website port 3000, backend 5000), isliye us route par `cross-origin` set kiya.
- Website ke baaki design wale pages ka final code section 13 me hai (bhasha wale versions).

### backend/lib/uploads.ts (naya)

```ts
import fs from "node:fs";
import path from "node:path";

// backend folder me "uploads" (npm run dev backend folder se chalta hai)
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
```

### backend/middleware/rateLimit.ts

Sabse neeche:

```ts
export const uploadLimiter = make(15 * 60_000, 30, "Bahut zyada photo upload, thodi der baad try karo");
```

### backend/routes/photos.ts (naya)

```ts
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
```

### backend/app.ts

Upar imports me:

```ts
import photosRouter from "./routes/photos.js";
import { UPLOAD_DIR } from "./lib/uploads.js";
```

`api.use(reviewsRouter);` ke neeche:

```ts
api.use("/providers", photosRouter);
```

Aur `app.use("/api/v1", api);` ki line ke **theek upar**:

```ts
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  },
  express.static(UPLOAD_DIR, { maxAge: "7d", immutable: true, index: false, dotfiles: "deny" }),
);
```

### backend/.gitignore (photos GitHub par nahi jayengi), `backend` folder se

```
Add-Content -Path .gitignore -Value "/uploads"
```

### web/src/app/globals.css (poori file)

```css
@import "tailwindcss";

:root {
  color-scheme: light;
  --background: #fffaf5;
  --foreground: #1f2937;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-poppins), var(--font-devanagari), system-ui, sans-serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

### web/src/app/icon.svg (naya, browser tab ka logo)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#ea580c"/>
  <rect x="12" y="24" width="40" height="26" rx="5" fill="#ffffff"/>
  <rect x="16" y="18" width="32" height="8" rx="3" fill="#ffedd5"/>
  <path d="M26 18v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <path d="M12 37h40" stroke="#ea580c" stroke-width="3"/>
</svg>
```

### web/src/components/logo.tsx (naya)

```tsx
export default function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#ea580c" />
        <rect x="12" y="24" width="40" height="26" rx="5" fill="#ffffff" />
        <rect x="16" y="18" width="32" height="8" rx="3" fill="#ffedd5" />
        <path d="M26 18v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 37h40" stroke="#ea580c" strokeWidth="3" />
      </svg>
      <span className="text-lg font-bold text-orange-700">Tiffin Ghar</span>
    </span>
  );
}
```

### web/src/components/thumb.tsx (naya, photo ya placeholder)

```tsx
export default function Thumb({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <div aria-hidden="true" className={`flex items-center justify-center bg-orange-100 text-3xl ${className}`}>
      🍱
    </div>
  );
}
```

### web/src/lib/photo.ts (naya, `/uploads/...` ko poora link banata hai)

```ts
import { API_URL } from "@/lib/api";

export function photoSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${new URL(API_URL).origin}${url}`;
}
```

### web/src/lib/upload.ts (naya, photo ka raw data backend ko bhejna)

```ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { refreshInline } from "@/lib/authed";
import { ACCESS_COOKIE } from "@/lib/session";

export async function uploadImage(
  path: string,
  bytes: ArrayBuffer,
  contentType: string,
  returnTo: string,
): Promise<Response> {
  const login = `/login?next=${encodeURIComponent(returnTo)}`;
  const store = await cookies();

  let token = store.get(ACCESS_COOKIE)?.value ?? null;
  if (!token) {
    token = await refreshInline();
    if (!token) redirect(login);
  }

  const send = (t: string) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": contentType },
      body: new Blob([bytes], { type: contentType }),
      cache: "no-store",
    });

  try {
    let res = await send(token);
    // 401/403: token purana ya purana role. Naya token lekar ek baar aur.
    if (res.status === 401 || res.status === 403) {
      const fresh = await refreshInline();
      if (!fresh) redirect(login);
      res = await send(fresh);
    }
    return res;
  } catch {
    return new Response(JSON.stringify({ error: "Server se jud nahi paye, baad me try karo" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

## 13. Bhasha step: Hinglish, हिन्दी, English (code)

### Kaise kaam karta hai
- **3 bhashayein:** `hinglish` (default, purana text), `hi` (हिन्दी), `en` (English). Header me menu (`LanguageSwitcher`). Chuni hui bhasha cookie `tg_lang` (1 saal) me rehti hai.
- **Login hai to database me bhi** (`User.language`, `PATCH /api/v1/me/language`). Login ke baad: browser me bhasha chuni ho to wahi database me jati hai, nahi to database wali browser me lagti hai (`syncLanguageAfterLogin`). Isse mobile app me bhi wahi bhasha khul sakegi.
- **Poora text files me:** `web/src/i18n/messages/hinglish.ts` (asli, saari keys), `hi.ts`, `en.ts`. `hi.ts` aur `en.ts` ka type `Record<MessageKey, string>` hai, isliye koi key chhut jaye to `npx tsc --noEmit` error deta hai. Placeholder `{city}`, `{n}` jaise hain, teeno bhashaon me barabar.
- **Server pages:** `const { t, locale } = await getT();` phir `t("home.search")`. **Client components:** `const t = useT();` (layout me `I18nProvider` poore app ko text deta hai, sirf chuni hui bhasha ke messages client tak jate hain).
- **Backend ke error:** backend abhi bhi Hinglish me hi error bhejta hai. Website `translateError` (`i18n/errors.ts`) exact text se key dhundhti hai aur user ki bhasha me dikhati hai. Jo message us list me nahi, wo jaisa hai waisa dikhta hai. Dynamic wala ("Order abhi ACCEPTED hai, isse CANCELLED nahi kar sakte") regex se. Server actions me `apiError(res)` yahi karta hai.
- **Jo translate nahi hota:** dukaan ka naam, dish ka naam aur description, shehar ke naam (provider ka likha hai), aur **admin panel** (sirf Hinglish, internal). Rate limit ke kuch purane message jo `errors.ts` me nahi hain wo bhi Hinglish me dikhte hain.
- Tarikh `formatDate(iso, locale)` se `en-IN` ya `hi-IN` me. `<html lang>`: `hi-Latn`, `hi`, `en`.
- **Naya text jodne ka tareeka:** pehle `hinglish.ts` me key (type apne aap bana leta hai), phir `hi.ts` aur `en.ts` me. Naya backend error ho to `errors.ts` ke `ERROR_KEYS` me bhi. **Nayi bhasha:** `config.ts` me `LOCALES` aur `LOCALE_LABEL`, `messages/index.ts` me file, aur nayi `xx.ts` (anuvad kisi jaankar se karwao, khane aur payment ke text me galti nahi chalti). Mobile app me yahi message files use hongi.
- Zip se ye sab files `web` aur `backend` folder me ek saath laga di gayi thi (`Expand-Archive`). Neeche unka final code hai.

### Manual badlav (zip me nahi the)

`backend/prisma/schema.prisma`, `model User` me:

```prisma
  language      String?
```

```
npx prisma migrate dev --name add_user_language
```

```
npx prisma generate
```

`backend/app.ts` me, upar imports me:

```ts
import meRouter from "./routes/me.js";
```

`api.use("/providers", photosRouter);` ke neeche:

```ts
api.use("/me", meRouter);
```

(`api.get("/me", ...)` jaisa tha waisa rahe, `/me/language` alag path hai.)

#### backend/routes/me.ts

```ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const languageSchema = z.object({
  language: z.enum(["hinglish", "hi", "en"], "Bhasha galat hai"),
});

// User ki pasand ki bhasha yaad rakho (website aur baad me mobile app dono ke liye)
router.patch("/language", requireAuth, validate(languageSchema), async (req: AuthedRequest, res, next) => {
  try {
    const { language } = req.body as z.infer<typeof languageSchema>;
    await prisma.user.update({
      where: { id: req.auth!.userId },
      data: { language },
    });
    res.json({ language });
  } catch (e) {
    next(e);
  }
});

export default router;
```

#### web/src/i18n/config.ts

```ts
// Server aur client dono me chalta hai (koi server import nahi)
export const LOCALES = ["hinglish", "hi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "hinglish";
export const LOCALE_COOKIE = "tg_lang";

export const LOCALE_LABEL: Record<Locale, string> = {
  hinglish: "Hinglish",
  hi: "हिन्दी",
  en: "English",
};

// <html lang="...">
export const HTML_LANG: Record<Locale, string> = {
  hinglish: "hi-Latn",
  hi: "hi",
  en: "en",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
```

#### web/src/i18n/translate.ts

```ts
import type { MessageKey } from "./messages/hinglish";

export type Vars = Record<string, string | number>;
export type Translator = (key: MessageKey, vars?: Vars) => string;

// "{n} item" jaise text me {n} ki jagah value
export function makeT(messages: Record<MessageKey, string>): Translator {
  return (key, vars) => {
    const msg = messages[key] ?? key;
    if (!vars) return msg;
    return msg.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
  };
}
```

#### web/src/i18n/messages/index.ts

```ts
import type { Locale } from "../config";
import { hinglish, type MessageKey } from "./hinglish";
import { hi } from "./hi";
import { en } from "./en";

// Sirf server par use hota hai, client ko sirf chuni hui bhasha ke messages milte hain
export function messagesFor(locale: Locale): Record<MessageKey, string> {
  if (locale === "hi") return hi;
  if (locale === "en") return en;
  return hinglish;
}
```

#### web/src/i18n/server.ts

```ts
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { translateError } from "./errors";
import { messagesFor } from "./messages";
import { makeT } from "./translate";

export const LOCALE_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// Server pages aur actions me: const { t } = await getT();
export async function getT() {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  return { t: makeT(messages), locale, messages };
}

// Backend ke jawab ka error, user ki bhasha me
export async function apiError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  const { t } = await getT();
  const message = typeof data?.error === "string" ? data.error : "";
  return message ? translateError(t, message) : t("err.generic");
}
```

#### web/src/i18n/client.tsx

```tsx
"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import type { MessageKey } from "./messages/hinglish";
import { makeT, type Translator } from "./translate";

type Ctx = { locale: Locale; t: Translator };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Record<MessageKey, string>;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: makeT(messages) }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Client components me: const t = useT();
export function useT(): Translator {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT ko I18nProvider ke andar use karo");
  return ctx.t;
}

export function useLocale(): Locale {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale ko I18nProvider ke andar use karo");
  return ctx.locale;
}
```

#### web/src/i18n/actions.ts

```ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { authedFetch } from "@/lib/authed";
import { getSession } from "@/lib/session";
import { LOCALE_COOKIE, isLocale } from "./config";
import { LOCALE_COOKIE_OPTIONS } from "./server";

export async function setLanguageAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS);

  // Login hai to database me bhi yaad rakho (mobile app me bhi wahi bhasha khule)
  const session = await getSession();
  if (session.status === "user") {
    await authedFetch("/me/language", {
      mode: "action",
      returnTo: "/",
      method: "PATCH",
      body: { language: locale },
    });
  }

  revalidatePath("/", "layout");
}
```

#### web/src/i18n/sync.ts

```ts
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import { LOCALE_COOKIE, isLocale } from "./config";
import { LOCALE_COOKIE_OPTIONS } from "./server";

// Login ke baad: browser me chuni bhasha ho to database me save karo,
// nahi to database ki bhasha browser me lagao. Fail ho to login nahi rukta.
export async function syncLanguageAfterLogin(accessToken: string): Promise<void> {
  try {
    const store = await cookies();
    const current = store.get(LOCALE_COOKIE)?.value;
    const headers = { Authorization: `Bearer ${accessToken}` };

    const res = await fetch(`${API_URL}/me`, { headers, cache: "no-store" });
    const me = res.ok ? ((await res.json()) as { language?: string | null }) : null;
    const saved = me?.language;

    if (isLocale(current)) {
      if (current !== saved) {
        await fetch(`${API_URL}/me/language`, {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ language: current }),
          cache: "no-store",
        });
      }
    } else if (isLocale(saved)) {
      store.set(LOCALE_COOKIE, saved, LOCALE_COOKIE_OPTIONS);
    }
  } catch {
    // koi baat nahi
  }
}
```

#### web/src/i18n/errors.ts

```ts
import type { MessageKey } from "./messages/hinglish";
import type { Translator } from "./translate";

// Backend ke message (exact text) se bhasha ki key. Naya message jo yahan nahi hai wo jaisa hai waisa dikhta hai.
const ERROR_KEYS: Record<string, MessageKey> = {
  "Aap apni hi dukaan se order nahi kar sakte": "err.ownShop",
  "Aapki provider profile pehle se bani hai": "err.profileExists",
  "Aapko ye karne ki ijazat nahi hai": "err.forbidden",
  "Ab ye order cancel nahi ho sakta": "err.cannotCancel",
  "Bahut galat koshish, naya OTP maango": "err.tooManyOtpTries",
  "Ek item ki quantity 20 se zyada nahi ho sakti": "err.qtyMax",
  "Galat item id": "err.badItemId",
  "Galat order id": "err.badOrderId",
  "Galat provider id": "err.badProviderId",
  "Item nahi mila": "err.itemNotFound",
  "JSON galat likha hai": "err.badJson",
  "Kuch gadbad hui, baad me try karo": "err.generic",
  "Kuch items aaj ke menu me nahi hain ya band hain": "err.itemsNotInMenu",
  "Login zaroori hai": "err.loginRequired",
  "OTP expire ho gaya, naya maango": "err.otpExpired",
  "OTP galat hai": "err.otpWrong",
  "Order ka total bahut zyada hai": "err.totalTooHigh",
  "Order nahi mila": "err.orderNotFound",
  "Order pehle hi cancel ho chuka hai": "err.alreadyCancelled",
  "Pehle OTP maango": "err.askOtpFirst",
  "Profile abhi approve nahi hui hai": "err.notApproved",
  "Provider profile nahi mili": "err.providerProfileMissing",
  "Session khatam ho gaya, dobara login karo": "err.sessionEnded",
  "Thoda ruko, 1 minute baad dobara try karo": "err.slowDown",
  "Token galat ya expire hai, dobara login karo": "err.tokenBad",
  "Token galat ya expire hai": "err.tokenBad",
  "User nahi mila": "err.userNotFound",
  "Ye dukaan abhi band hai ya mili nahi": "err.shopClosed",
  "Ye route nahi mila": "err.routeNotFound",
  "Items galat hain, page reload karo": "err.itemsBad",
  "Server se jud nahi paye, baad me try karo": "err.network",
  "Server se baat nahi ho pa rahi, baad me try karo": "err.network",
  "Galat input": "err.badInput",
  "Galat data": "err.badInput",
  "6 digit ka OTP daalo": "err.otp6",
  "6 digit ka pincode daalo": "err.pincode6",
  "Daam kam se kam ₹1 ho": "err.priceMin",
  "Daam number me daalo": "err.priceNumber",
  "Daam paise me, poora number daalo (₹85 = 8500)": "err.pricePaise",
  "Daam ₹10,000 se zyada nahi ho sakta": "err.priceMax",
  "Delivery ka pata likho": "err.addressRequired",
  "Delivery ka poora pata likho": "err.addressRequired",
  "Poora pata likho": "err.addressRequired",
  "Dish ka naam likho": "err.dishName",
  "Dukaan ka naam likho": "err.shopName",
  "Ek order me 20 se zyada alag items nahi ho sakte": "err.itemsMax",
  "FSSAI number 14 digit ka hota hai": "err.fssai",
  "Items ki list bhejo": "err.itemsList",
  "Kam se kam ek item chuno": "err.itemsMin",
  "Kuch to badalne ke liye bhejo": "err.nothingToChange",
  "Limit 1 se 50 ke beech rakho": "err.limitRange",
  "Note 200 akshar se chhota rakho": "err.noteMax",
  "Page 1 ya usse bada hona chahiye": "err.pageMin",
  "Pata 250 akshar se chhota rakho": "err.addressMax",
  "Quantity 1 se 20 ke beech rakho": "err.qtyRange",
  "Quantity number me daalo": "err.qtyNumber",
  "Refresh token galat hai": "err.refreshBad",
  "Sahi 10 digit ka mobile number daalo": "err.phone10",
  "Sahi id bhejo": "err.idBad",
  "Shehar likho": "err.cityRequired",
  "Status galat hai": "err.statusBad",
  "Rating 1 se 5 ke beech chuno": "err.ratingRange",
  "Review 500 akshar se chhota rakho": "err.reviewMax",
  "Review sirf pahunche hue order par de sakte ho": "err.reviewNotDelivered",
  "Is order ka review pehle hi ho chuka hai": "err.reviewExists",
  "Dukaan nahi mili": "err.shopNotFound",
  "Provider nahi mila": "err.providerNotFound",
  "Photo 2 MB se chhoti rakho (JPG, PNG ya WebP)": "err.photoTooBig",
  "Sirf JPG, PNG ya WebP photo bhejo": "err.photoType",
  "Ye photo sahi nahi hai. JPG, PNG ya WebP bhejo": "err.photoBad",
  "Bahut zyada reviews, thodi der baad try karo": "err.tooManyReviews",
  "Bahut zyada photo upload, thodi der baad try karo": "err.tooManyUploads",
  "Bhasha galat hai": "err.langBad",
};

const PSTATUS: Record<string, MessageKey> = {
  PLACED: "pstatus.PLACED",
  ACCEPTED: "pstatus.ACCEPTED",
  PREPARING: "pstatus.PREPARING",
  OUT_FOR_DELIVERY: "pstatus.OUT_FOR_DELIVERY",
  DELIVERED: "pstatus.DELIVERED",
  REJECTED: "pstatus.REJECTED",
  CANCELLED: "pstatus.CANCELLED",
};

export function translateError(t: Translator, message: string): string {
  const key = ERROR_KEYS[message];
  if (key) return t(key);

  // "Order abhi ACCEPTED hai, isse CANCELLED nahi kar sakte"
  const m = /^Order abhi ([A-Z_]+) hai, isse ([A-Z_]+) nahi kar sakte$/.exec(message);
  if (m) {
    const from = PSTATUS[m[1]];
    const to = PSTATUS[m[2]];
    if (from && to) return t("err.statusConflict", { from: t(from), to: t(to) });
  }

  return message;
}
```

#### web/src/i18n/messages/hinglish.ts

```ts
// Hinglish (Roman Hindi): yahi asli text hai. Naya text pehle yahan, phir hi.ts aur en.ts me.
export const hinglish = {
  "common.loading": "Ruko...",
  "common.save": "Save karo",
  "common.remove": "Hatao",
  "common.edit": "Badlo",
  "meta.title": "Tiffin Ghar: ghar ka khana, aapke shehar me",
  "meta.description": "Apne shehar ki ghar ke khane wali tiffin dukaanein, aaj ka menu aur COD order.",
  "nav.myOrders": "Mere orders",
  "nav.openShop": "Dukaan kholo",
  "nav.login": "Login",
  "nav.logout": "Logout",
  "nav.dashboard": "Dashboard",
  "nav.admin": "Admin",
  "nav.startShop": "Apni dukaan kholo",
  "nav.website": "Website",
  "nav.home": "Home",
  "nav.back": "Wapas",
  "nav.language": "Bhasha",
  "footer.tagline": "Ghar ka khana, aapke shehar me. Payment abhi sirf COD (delivery par).",
  "home.heroA": "Ghar ka khana,",
  "home.heroB": "aapke shehar me",
  "home.heroSub": "Apne aas-paas ki tiffin dukaanein dekho, aaj ka menu chuno aur ghar baithe order karo.",
  "home.searchPlaceholder": "Apna shehar likho (jaise Prayagraj)",
  "home.search": "Dhundo",
  "home.shopsIn": "{city} ki dukaanein",
  "home.noShops": "{city} me abhi koi khuli dukaan nahi mili.",
  "home.how": "Kaise kaam karta hai",
  "home.step1Title": "Shehar chuno",
  "home.step1Text": "Apne shehar ki khuli tiffin dukaanein dekho.",
  "home.step2Title": "Aaj ka menu",
  "home.step2Text": "Har dukaan ka aaj ka khana aur daam ek jagah.",
  "home.step3Title": "Order karo",
  "home.step3Text": "COD me order do, ghar par khana pao.",
  "home.ctaTitle": "Apni tiffin dukaan hai?",
  "home.ctaText": "Menu daalo, orders lo aur apne shehar ke customers tak pahucho.",
  "home.ctaButton": "Dukaan kholo",
  "rating.none": "Abhi koi rating nahi",
  "rating.count": "({n} review)",
  "shop.reviewsLink": "Reviews dekho",
  "shop.todayMenu": "Aaj ka menu ({day})",
  "shop.noItems": "Aaj ke liye abhi koi item nahi hai.",
  "shop.closed": "Ye dukaan abhi band hai ya mili nahi.",
  "shop.notFound": "Ye dukaan nahi mili.",
  "of.veg": "Veg",
  "of.nonveg": "Non-veg",
  "of.less": "Kam karo",
  "of.more": "Badhao",
  "of.loginFirst": "Order dene ke liye login zaroori hai.",
  "of.loginButton": "Login karo",
  "of.title": "Aapka order",
  "of.pick": "Upar se items chuno (+ dabao).",
  "of.summary": "{count} item, total {total} (payment: COD, delivery par)",
  "of.addrPh": "Delivery ka poora pata",
  "of.notePh": "Dukaan ke liye note (optional)",
  "of.submit": "Order karo",
  "orders.title": "Mere orders",
  "orders.loadFail": "Orders nahi la paye, baad me try karo.",
  "orders.empty": "Abhi tak koi order nahi diya.",
  "orders.items": "{n} item",
  "orders.older": "Aur purane orders",
  "orders.notFound": "Ye order nahi mila.",
  "orders.orderLoadFail": "Order nahi la paye, baad me try karo.",
  "orders.number": "Order #{id}",
  "orders.total": "Total (COD, delivery par)",
  "orders.address": "Delivery ka pata: {address}",
  "orders.note": "Note: {note}",
  "orders.cancel": "Order cancel karo",
  "orders.reviewMine": "Aapka review",
  "orders.reviewAsk": "Khana kaisa laga?",
  "review.placeholder": "Kuch likhna ho to likho (optional)",
  "review.submit": "Review bhejo",
  "review.star": "{n} star",
  "reviews.title": "Reviews",
  "reviews.empty": "Abhi koi review nahi hai.",
  "reviews.customer": "Customer {name}",
  "reviews.newer": "Naye reviews",
  "reviews.older": "Aur purane",
  "status.PLACED": "Order mil gaya, dukaan ke jawab ka intezaar",
  "status.ACCEPTED": "Dukaan ne accept kar liya",
  "status.PREPARING": "Ban raha hai",
  "status.OUT_FOR_DELIVERY": "Raaste me hai",
  "status.DELIVERED": "Pahunch gaya",
  "status.REJECTED": "Dukaan ne mana kar diya",
  "status.CANCELLED": "Cancel ho gaya",
  "pstatus.PLACED": "Naya order",
  "pstatus.ACCEPTED": "Accept kiya",
  "pstatus.PREPARING": "Ban raha hai",
  "pstatus.OUT_FOR_DELIVERY": "Raaste me hai",
  "pstatus.DELIVERED": "Pahunch gaya",
  "pstatus.REJECTED": "Mana kiya",
  "pstatus.CANCELLED": "Customer ne cancel kiya",
  "action.ACCEPTED": "Accept karo",
  "action.REJECTED": "Mana karo",
  "action.PREPARING": "Ban raha hai",
  "action.OUT_FOR_DELIVERY": "Raaste me hai",
  "action.DELIVERED": "Pahunch gaya",
  "filter.all": "Sab",
  "filter.PLACED": "Naye",
  "filter.ACCEPTED": "Accept kiye",
  "filter.PREPARING": "Ban raha hai",
  "filter.OUT_FOR_DELIVERY": "Raaste me",
  "filter.DELIVERED": "Pahunch gaye",
  "filter.REJECTED": "Mana kiye",
  "filter.CANCELLED": "Cancel",
  "day.0": "Ravivar",
  "day.1": "Somvar",
  "day.2": "Mangalvar",
  "day.3": "Budhvar",
  "day.4": "Guruvar",
  "day.5": "Shukravar",
  "day.6": "Shanivar",
  "login.title": "Login",
  "login.tabCustomer": "Customer",
  "login.tabProvider": "Provider",
  "login.introCustomer": "Tiffin order karne ke liye apne mobile number se login karo, OTP aayega.",
  "login.introProvider": "Apni tiffin dukaan sambhalne ke liye login karo. Pehli baar ho to login ke baad dukaan ki profile bharni hogi.",
  "login.phone": "Mobile number (10 digit)",
  "login.sendOtp": "OTP bhejo",
  "login.otpFor": "{phone} ka OTP daalo",
  "login.otp": "6 digit ka OTP",
  "login.verify": "Login karo",
  "login.changeNumber": "Number badlo",
  "dash.tabHome": "Dukaan",
  "dash.tabMenu": "Menu",
  "dash.tabOrders": "Orders",
  "dash.tabReviews": "Reviews",
  "dash.newText": "Dukaan ki jaankari bharo. Admin approve karega tab customers ko dikhegi.",
  "dash.adminNote": "Admin ke liye alag panel hai.",
  "dash.adminPanel": "Admin panel kholo",
  "dash.profileFail": "Profile nahi la paye, baad me try karo.",
  "dash.pending": "Approval ka intezaar. Admin approve karega tab dukaan khul payegi. Tab tak aap menu bana sakte ho.",
  "dash.rejected": "Aapki profile approve nahi hui. Jaankari theek karke admin se baat karo.",
  "dash.shopOpen": "Dukaan abhi khuli hai (customers ko dikh rahi hai)",
  "dash.shopClosed": "Dukaan abhi band hai",
  "dash.closeBtn": "Dukaan band karo",
  "dash.openBtn": "Dukaan kholo",
  "dash.newOrders": "Naye orders: {n}",
  "dash.ordersHint": "Orders dekho aur status badlo",
  "dash.address": "Pata: {address}",
  "dash.fssai": "FSSAI: {value}",
  "dash.fssaiNone": "daala nahi",
  "dash.editProfile": "Profile badlo",
  "dash.photoTitle": "Dukaan ki photo",
  "dash.photoHint": "Customers ko dukaan ke card par yahi photo dikhegi.",
  "pf.shopName": "Dukaan ka naam",
  "pf.city": "Shehar",
  "pf.address": "Poora pata",
  "pf.pincode": "Pincode (6 digit)",
  "pf.fssai": "FSSAI number (14 digit, abhi nahi hai to khali chhodo)",
  "pf.saved": "Save ho gaya.",
  "pf.create": "Dukaan ki profile banao",
  "menu.title": "Mera menu",
  "menu.hint": "Customers ko sirf aaj ka menu dikhta hai: jis item ka din aaj ka ya 'Har din' ho aur jo chalu ho.",
  "menu.added": "Item jud gaya.",
  "menu.formAdd": "Naya item jodo",
  "menu.formEdit": "Item badlo",
  "menu.cancelEdit": "Rehne do",
  "menu.all": "Saare items",
  "menu.loadFail": "Menu nahi la paye, baad me try karo.",
  "menu.empty": "Abhi koi item nahi hai. Upar se pehla item jodo.",
  "menu.everyDay": "Har din",
  "menu.on": "Chalu",
  "menu.off": "Band",
  "menu.turnOff": "Band karo",
  "menu.turnOn": "Chalu karo",
  "menu.confirmDelete": "Ye item hata dein?",
  "item.name": "Dish ka naam",
  "item.desc": "Kya-kya hai (optional)",
  "item.price": "Daam (rupaye me, jaise 85 ya 85.50)",
  "item.day": "Kis din",
  "item.veg": "Veg hai",
  "item.available": "Chalu hai (customers ko dikhe)",
  "item.add": "Item jodo",
  "porders.title": "Orders",
  "porders.hint": "Ye page har 30 second me apne aap naye orders la leta hai.",
  "porders.loadFail": "Orders nahi la paye, baad me try karo.",
  "porders.none": "Is filter me koi order nahi hai.",
  "porders.customer": "Customer:",
  "porders.address": "Delivery ka pata: {address}",
  "porders.note": "Note: {note}",
  "porders.total": "Total (COD, customer se cash lena)",
  "porders.confirmReject": "Ye order mana karna hai?",
  "porders.newer": "Naye orders",
  "photo.add": "Photo lagao",
  "photo.change": "Photo badlo",
  "photo.uploading": "Upload ho rahi hai...",
  "photo.alt": "Photo",
  "dreviews.pending": "Dukaan approve hone ke baad customers ke reviews yahan dikhenge.",
  "dreviews.none": "Abhi koi review nahi aaya.",
  "err.ownShop": "Aap apni hi dukaan se order nahi kar sakte",
  "err.profileExists": "Aapki provider profile pehle se bani hai",
  "err.forbidden": "Aapko ye karne ki ijazat nahi hai",
  "err.cannotCancel": "Ab ye order cancel nahi ho sakta",
  "err.tooManyOtpTries": "Bahut galat koshish, naya OTP maango",
  "err.qtyMax": "Ek item ki quantity 20 se zyada nahi ho sakti",
  "err.badItemId": "Galat item id",
  "err.badOrderId": "Galat order id",
  "err.badProviderId": "Galat provider id",
  "err.itemNotFound": "Item nahi mila",
  "err.badJson": "JSON galat likha hai",
  "err.generic": "Kuch gadbad hui, baad me try karo",
  "err.itemsNotInMenu": "Kuch items aaj ke menu me nahi hain ya band hain",
  "err.loginRequired": "Login zaroori hai",
  "err.otpExpired": "OTP expire ho gaya, naya maango",
  "err.otpWrong": "OTP galat hai",
  "err.totalTooHigh": "Order ka total bahut zyada hai",
  "err.orderNotFound": "Order nahi mila",
  "err.alreadyCancelled": "Order pehle hi cancel ho chuka hai",
  "err.askOtpFirst": "Pehle OTP maango",
  "err.notApproved": "Profile abhi approve nahi hui hai",
  "err.providerProfileMissing": "Provider profile nahi mili",
  "err.sessionEnded": "Session khatam ho gaya, dobara login karo",
  "err.slowDown": "Thoda ruko, 1 minute baad dobara try karo",
  "err.tokenBad": "Token galat ya expire hai, dobara login karo",
  "err.userNotFound": "User nahi mila",
  "err.shopClosed": "Ye dukaan abhi band hai ya mili nahi",
  "err.routeNotFound": "Ye route nahi mila",
  "err.itemsBad": "Items galat hain, page reload karo",
  "err.network": "Server se jud nahi paye, baad me try karo",
  "err.badInput": "Galat input",
  "err.otp6": "6 digit ka OTP daalo",
  "err.pincode6": "6 digit ka pincode daalo",
  "err.priceMin": "Daam kam se kam ₹1 ho",
  "err.priceNumber": "Daam number me daalo",
  "err.pricePaise": "Daam paise me, poora number daalo (₹85 = 8500)",
  "err.priceMax": "Daam ₹10,000 se zyada nahi ho sakta",
  "err.addressRequired": "Delivery ka pata likho",
  "err.dishName": "Dish ka naam likho",
  "err.shopName": "Dukaan ka naam likho",
  "err.itemsMax": "Ek order me 20 se zyada alag items nahi ho sakte",
  "err.fssai": "FSSAI number 14 digit ka hota hai",
  "err.itemsList": "Items ki list bhejo",
  "err.itemsMin": "Kam se kam ek item chuno",
  "err.nothingToChange": "Kuch to badalne ke liye bhejo",
  "err.limitRange": "Limit 1 se 50 ke beech rakho",
  "err.noteMax": "Note 200 akshar se chhota rakho",
  "err.pageMin": "Page 1 ya usse bada hona chahiye",
  "err.addressMax": "Pata 250 akshar se chhota rakho",
  "err.qtyRange": "Quantity 1 se 20 ke beech rakho",
  "err.qtyNumber": "Quantity number me daalo",
  "err.refreshBad": "Refresh token galat hai",
  "err.phone10": "Sahi 10 digit ka mobile number daalo",
  "err.idBad": "Sahi id bhejo",
  "err.cityRequired": "Shehar likho",
  "err.statusBad": "Status galat hai",
  "err.ratingRange": "Rating 1 se 5 ke beech chuno",
  "err.reviewMax": "Review 500 akshar se chhota rakho",
  "err.reviewNotDelivered": "Review sirf pahunche hue order par de sakte ho",
  "err.reviewExists": "Is order ka review pehle hi ho chuka hai",
  "err.shopNotFound": "Dukaan nahi mili",
  "err.providerNotFound": "Provider nahi mila",
  "err.photoTooBig": "Photo 2 MB se chhoti rakho (JPG, PNG ya WebP)",
  "err.photoType": "Sirf JPG, PNG ya WebP photo bhejo",
  "err.photoBad": "Ye photo sahi nahi hai. JPG, PNG ya WebP bhejo",
  "err.tooManyReviews": "Bahut zyada reviews, thodi der baad try karo",
  "err.tooManyUploads": "Bahut zyada photo upload, thodi der baad try karo",
  "err.langBad": "Bhasha galat hai",
  "err.priceRupees": "Daam rupaye me likho (jaise 85 ya 85.50)",
  "err.dayBad": "Din galat hai",
  "err.itemBad": "Galat item",
  "err.photoMissing": "Photo nahi mili",
  "err.photoLarge": "Photo bahut badi hai",
  "err.photoOnly": "Sirf photo chuno",
  "err.photoOpen": "Ye photo nahi khul payi. JPG ya PNG try karo.",
  "err.statusConflict": "Order abhi {from} hai, isse {to} nahi kar sakte",
} as const;

export type MessageKey = keyof typeof hinglish;
```

#### web/src/i18n/messages/hi.ts

```ts
import type { MessageKey } from "./hinglish";

// हिन्दी (देवनागरी)
export const hi: Record<MessageKey, string> = {
  "common.loading": "रुकिए...",
  "common.save": "सेव करें",
  "common.remove": "हटाएँ",
  "common.edit": "बदलें",
  "meta.title": "टिफिन घर: घर का खाना, आपके शहर में",
  "meta.description": "आपके शहर की घर के खाने वाली टिफिन दुकानें, आज का मेन्यू और COD ऑर्डर।",
  "nav.myOrders": "मेरे ऑर्डर",
  "nav.openShop": "दुकान खोलें",
  "nav.login": "लॉगिन",
  "nav.logout": "लॉगआउट",
  "nav.dashboard": "डैशबोर्ड",
  "nav.admin": "एडमिन",
  "nav.startShop": "अपनी दुकान खोलें",
  "nav.website": "वेबसाइट",
  "nav.home": "होम",
  "nav.back": "वापस",
  "nav.language": "भाषा",
  "footer.tagline": "घर का खाना, आपके शहर में। पेमेंट अभी सिर्फ़ COD (डिलीवरी पर)।",
  "home.heroA": "घर का खाना,",
  "home.heroB": "आपके शहर में",
  "home.heroSub": "अपने आस-पास की टिफिन दुकानें देखें, आज का मेन्यू चुनें और घर बैठे ऑर्डर करें।",
  "home.searchPlaceholder": "अपना शहर लिखें (जैसे Prayagraj)",
  "home.search": "खोजें",
  "home.shopsIn": "{city} की दुकानें",
  "home.noShops": "{city} में अभी कोई खुली दुकान नहीं मिली।",
  "home.how": "यह कैसे काम करता है",
  "home.step1Title": "शहर चुनें",
  "home.step1Text": "अपने शहर की खुली टिफिन दुकानें देखें।",
  "home.step2Title": "आज का मेन्यू",
  "home.step2Text": "हर दुकान का आज का खाना और दाम एक जगह।",
  "home.step3Title": "ऑर्डर करें",
  "home.step3Text": "COD में ऑर्डर दें, घर पर खाना पाएँ।",
  "home.ctaTitle": "क्या आपकी अपनी टिफिन दुकान है?",
  "home.ctaText": "मेन्यू डालें, ऑर्डर लें और अपने शहर के ग्राहकों तक पहुँचें।",
  "home.ctaButton": "दुकान खोलें",
  "rating.none": "अभी कोई रेटिंग नहीं",
  "rating.count": "({n} रिव्यू)",
  "shop.reviewsLink": "रिव्यू देखें",
  "shop.todayMenu": "आज का मेन्यू ({day})",
  "shop.noItems": "आज के लिए अभी कोई आइटम नहीं है।",
  "shop.closed": "यह दुकान अभी बंद है या मिली नहीं।",
  "shop.notFound": "यह दुकान नहीं मिली।",
  "of.veg": "शाकाहारी",
  "of.nonveg": "मांसाहारी",
  "of.less": "कम करें",
  "of.more": "बढ़ाएँ",
  "of.loginFirst": "ऑर्डर देने के लिए लॉगिन ज़रूरी है।",
  "of.loginButton": "लॉगिन करें",
  "of.title": "आपका ऑर्डर",
  "of.pick": "ऊपर से आइटम चुनें (+ दबाएँ)।",
  "of.summary": "{count} आइटम, कुल {total} (पेमेंट: COD, डिलीवरी पर)",
  "of.addrPh": "डिलीवरी का पूरा पता",
  "of.notePh": "दुकान के लिए नोट (वैकल्पिक)",
  "of.submit": "ऑर्डर करें",
  "orders.title": "मेरे ऑर्डर",
  "orders.loadFail": "ऑर्डर नहीं ला पाए, बाद में कोशिश करें।",
  "orders.empty": "अभी तक कोई ऑर्डर नहीं दिया।",
  "orders.items": "{n} आइटम",
  "orders.older": "और पुराने ऑर्डर",
  "orders.notFound": "यह ऑर्डर नहीं मिला।",
  "orders.orderLoadFail": "ऑर्डर नहीं ला पाए, बाद में कोशिश करें।",
  "orders.number": "ऑर्डर #{id}",
  "orders.total": "कुल (COD, डिलीवरी पर)",
  "orders.address": "डिलीवरी का पता: {address}",
  "orders.note": "नोट: {note}",
  "orders.cancel": "ऑर्डर रद्द करें",
  "orders.reviewMine": "आपका रिव्यू",
  "orders.reviewAsk": "खाना कैसा लगा?",
  "review.placeholder": "कुछ लिखना हो तो लिखें (वैकल्पिक)",
  "review.submit": "रिव्यू भेजें",
  "review.star": "{n} स्टार",
  "reviews.title": "रिव्यू",
  "reviews.empty": "अभी कोई रिव्यू नहीं है।",
  "reviews.customer": "ग्राहक {name}",
  "reviews.newer": "नए रिव्यू",
  "reviews.older": "और पुराने",
  "status.PLACED": "ऑर्डर मिल गया, दुकान के जवाब का इंतज़ार",
  "status.ACCEPTED": "दुकान ने स्वीकार कर लिया",
  "status.PREPARING": "बन रहा है",
  "status.OUT_FOR_DELIVERY": "रास्ते में है",
  "status.DELIVERED": "पहुँच गया",
  "status.REJECTED": "दुकान ने मना कर दिया",
  "status.CANCELLED": "रद्द हो गया",
  "pstatus.PLACED": "नया ऑर्डर",
  "pstatus.ACCEPTED": "स्वीकार किया",
  "pstatus.PREPARING": "बन रहा है",
  "pstatus.OUT_FOR_DELIVERY": "रास्ते में है",
  "pstatus.DELIVERED": "पहुँच गया",
  "pstatus.REJECTED": "मना किया",
  "pstatus.CANCELLED": "ग्राहक ने रद्द किया",
  "action.ACCEPTED": "स्वीकार करें",
  "action.REJECTED": "मना करें",
  "action.PREPARING": "बन रहा है",
  "action.OUT_FOR_DELIVERY": "रास्ते में है",
  "action.DELIVERED": "पहुँच गया",
  "filter.all": "सब",
  "filter.PLACED": "नए",
  "filter.ACCEPTED": "स्वीकार किए",
  "filter.PREPARING": "बन रहा है",
  "filter.OUT_FOR_DELIVERY": "रास्ते में",
  "filter.DELIVERED": "पहुँचे",
  "filter.REJECTED": "मना किए",
  "filter.CANCELLED": "रद्द",
  "day.0": "रविवार",
  "day.1": "सोमवार",
  "day.2": "मंगलवार",
  "day.3": "बुधवार",
  "day.4": "गुरुवार",
  "day.5": "शुक्रवार",
  "day.6": "शनिवार",
  "login.title": "लॉगिन",
  "login.tabCustomer": "ग्राहक",
  "login.tabProvider": "दुकानदार",
  "login.introCustomer": "टिफिन ऑर्डर करने के लिए अपने मोबाइल नंबर से लॉगिन करें, OTP आएगा।",
  "login.introProvider": "अपनी टिफिन दुकान सँभालने के लिए लॉगिन करें। पहली बार हो तो लॉगिन के बाद दुकान की प्रोफ़ाइल भरनी होगी।",
  "login.phone": "मोबाइल नंबर (10 अंक)",
  "login.sendOtp": "OTP भेजें",
  "login.otpFor": "{phone} का OTP डालें",
  "login.otp": "6 अंकों का OTP",
  "login.verify": "लॉगिन करें",
  "login.changeNumber": "नंबर बदलें",
  "dash.tabHome": "दुकान",
  "dash.tabMenu": "मेन्यू",
  "dash.tabOrders": "ऑर्डर",
  "dash.tabReviews": "रिव्यू",
  "dash.newText": "दुकान की जानकारी भरें। एडमिन मंज़ूर करेगा तब ग्राहकों को दिखेगी।",
  "dash.adminNote": "एडमिन के लिए अलग पैनल है।",
  "dash.adminPanel": "एडमिन पैनल खोलें",
  "dash.profileFail": "प्रोफ़ाइल नहीं ला पाए, बाद में कोशिश करें।",
  "dash.pending": "मंज़ूरी का इंतज़ार। एडमिन मंज़ूर करेगा तब दुकान खुल पाएगी। तब तक आप मेन्यू बना सकते हैं।",
  "dash.rejected": "आपकी प्रोफ़ाइल मंज़ूर नहीं हुई। जानकारी ठीक करके एडमिन से बात करें।",
  "dash.shopOpen": "दुकान अभी खुली है (ग्राहकों को दिख रही है)",
  "dash.shopClosed": "दुकान अभी बंद है",
  "dash.closeBtn": "दुकान बंद करें",
  "dash.openBtn": "दुकान खोलें",
  "dash.newOrders": "नए ऑर्डर: {n}",
  "dash.ordersHint": "ऑर्डर देखें और स्टेटस बदलें",
  "dash.address": "पता: {address}",
  "dash.fssai": "FSSAI: {value}",
  "dash.fssaiNone": "डाला नहीं",
  "dash.editProfile": "प्रोफ़ाइल बदलें",
  "dash.photoTitle": "दुकान की फ़ोटो",
  "dash.photoHint": "ग्राहकों को दुकान के कार्ड पर यही फ़ोटो दिखेगी।",
  "pf.shopName": "दुकान का नाम",
  "pf.city": "शहर",
  "pf.address": "पूरा पता",
  "pf.pincode": "पिनकोड (6 अंक)",
  "pf.fssai": "FSSAI नंबर (14 अंक, अभी नहीं है तो खाली छोड़ें)",
  "pf.saved": "सेव हो गया।",
  "pf.create": "दुकान की प्रोफ़ाइल बनाएँ",
  "menu.title": "मेरा मेन्यू",
  "menu.hint": "ग्राहकों को सिर्फ़ आज का मेन्यू दिखता है: जिस आइटम का दिन आज का या 'हर दिन' हो और जो चालू हो।",
  "menu.added": "आइटम जुड़ गया।",
  "menu.formAdd": "नया आइटम जोड़ें",
  "menu.formEdit": "आइटम बदलें",
  "menu.cancelEdit": "रहने दें",
  "menu.all": "सभी आइटम",
  "menu.loadFail": "मेन्यू नहीं ला पाए, बाद में कोशिश करें।",
  "menu.empty": "अभी कोई आइटम नहीं है। ऊपर से पहला आइटम जोड़ें।",
  "menu.everyDay": "हर दिन",
  "menu.on": "चालू",
  "menu.off": "बंद",
  "menu.turnOff": "बंद करें",
  "menu.turnOn": "चालू करें",
  "menu.confirmDelete": "यह आइटम हटा दें?",
  "item.name": "डिश का नाम",
  "item.desc": "क्या-क्या है (वैकल्पिक)",
  "item.price": "दाम (रुपये में, जैसे 85 या 85.50)",
  "item.day": "किस दिन",
  "item.veg": "शाकाहारी है",
  "item.available": "चालू है (ग्राहकों को दिखे)",
  "item.add": "आइटम जोड़ें",
  "porders.title": "ऑर्डर",
  "porders.hint": "यह पेज हर 30 सेकंड में अपने आप नए ऑर्डर ले आता है।",
  "porders.loadFail": "ऑर्डर नहीं ला पाए, बाद में कोशिश करें।",
  "porders.none": "इस फ़िल्टर में कोई ऑर्डर नहीं है।",
  "porders.customer": "ग्राहक:",
  "porders.address": "डिलीवरी का पता: {address}",
  "porders.note": "नोट: {note}",
  "porders.total": "कुल (COD, ग्राहक से कैश लेना)",
  "porders.confirmReject": "यह ऑर्डर मना करना है?",
  "porders.newer": "नए ऑर्डर",
  "photo.add": "फ़ोटो लगाएँ",
  "photo.change": "फ़ोटो बदलें",
  "photo.uploading": "अपलोड हो रही है...",
  "photo.alt": "फ़ोटो",
  "dreviews.pending": "दुकान मंज़ूर होने के बाद ग्राहकों के रिव्यू यहाँ दिखेंगे।",
  "dreviews.none": "अभी कोई रिव्यू नहीं आया।",
  "err.ownShop": "आप अपनी ही दुकान से ऑर्डर नहीं कर सकते",
  "err.profileExists": "आपकी दुकान की प्रोफ़ाइल पहले से बनी है",
  "err.forbidden": "आपको यह करने की अनुमति नहीं है",
  "err.cannotCancel": "अब यह ऑर्डर रद्द नहीं हो सकता",
  "err.tooManyOtpTries": "बहुत ज़्यादा गलत कोशिशें, नया OTP मँगाएँ",
  "err.qtyMax": "एक आइटम की मात्रा 20 से ज़्यादा नहीं हो सकती",
  "err.badItemId": "आइटम आईडी गलत है",
  "err.badOrderId": "ऑर्डर आईडी गलत है",
  "err.badProviderId": "दुकान आईडी गलत है",
  "err.itemNotFound": "आइटम नहीं मिला",
  "err.badJson": "भेजा गया डेटा सही नहीं है",
  "err.generic": "कुछ गड़बड़ हुई, बाद में कोशिश करें",
  "err.itemsNotInMenu": "कुछ आइटम आज के मेन्यू में नहीं हैं या बंद हैं",
  "err.loginRequired": "लॉगिन ज़रूरी है",
  "err.otpExpired": "OTP की समय-सीमा खत्म हो गई, नया मँगाएँ",
  "err.otpWrong": "OTP गलत है",
  "err.totalTooHigh": "ऑर्डर का कुल बहुत ज़्यादा है",
  "err.orderNotFound": "ऑर्डर नहीं मिला",
  "err.alreadyCancelled": "ऑर्डर पहले ही रद्द हो चुका है",
  "err.askOtpFirst": "पहले OTP मँगाएँ",
  "err.notApproved": "प्रोफ़ाइल अभी मंज़ूर नहीं हुई है",
  "err.providerProfileMissing": "दुकान की प्रोफ़ाइल नहीं मिली",
  "err.sessionEnded": "सेशन खत्म हो गया, दोबारा लॉगिन करें",
  "err.slowDown": "थोड़ा रुकें, 1 मिनट बाद फिर कोशिश करें",
  "err.tokenBad": "टोकन गलत है या खत्म हो गया है, दोबारा लॉगिन करें",
  "err.userNotFound": "यूज़र नहीं मिला",
  "err.shopClosed": "यह दुकान अभी बंद है या मिली नहीं",
  "err.routeNotFound": "यह पेज नहीं मिला",
  "err.itemsBad": "आइटम सही नहीं हैं, पेज दोबारा लोड करें",
  "err.network": "सर्वर से जुड़ नहीं पाए, बाद में कोशिश करें",
  "err.badInput": "जानकारी सही नहीं है",
  "err.otp6": "6 अंकों का OTP डालें",
  "err.pincode6": "6 अंकों का पिनकोड डालें",
  "err.priceMin": "दाम कम से कम ₹1 हो",
  "err.priceNumber": "दाम नंबर में डालें",
  "err.pricePaise": "दाम पैसे में, पूरा नंबर डालें (₹85 = 8500)",
  "err.priceMax": "दाम ₹10,000 से ज़्यादा नहीं हो सकता",
  "err.addressRequired": "डिलीवरी का पता लिखें",
  "err.dishName": "डिश का नाम लिखें",
  "err.shopName": "दुकान का नाम लिखें",
  "err.itemsMax": "एक ऑर्डर में 20 से ज़्यादा अलग आइटम नहीं हो सकते",
  "err.fssai": "FSSAI नंबर 14 अंकों का होता है",
  "err.itemsList": "आइटमों की सूची भेजें",
  "err.itemsMin": "कम से कम एक आइटम चुनें",
  "err.nothingToChange": "बदलने के लिए कुछ तो भेजें",
  "err.limitRange": "लिमिट 1 से 50 के बीच रखें",
  "err.noteMax": "नोट 200 अक्षरों से छोटा रखें",
  "err.pageMin": "पेज 1 या उससे बड़ा होना चाहिए",
  "err.addressMax": "पता 250 अक्षरों से छोटा रखें",
  "err.qtyRange": "मात्रा 1 से 20 के बीच रखें",
  "err.qtyNumber": "मात्रा नंबर में डालें",
  "err.refreshBad": "रिफ्रेश टोकन गलत है",
  "err.phone10": "सही 10 अंकों का मोबाइल नंबर डालें",
  "err.idBad": "सही आईडी भेजें",
  "err.cityRequired": "शहर लिखें",
  "err.statusBad": "स्टेटस गलत है",
  "err.ratingRange": "रेटिंग 1 से 5 के बीच चुनें",
  "err.reviewMax": "रिव्यू 500 अक्षरों से छोटा रखें",
  "err.reviewNotDelivered": "रिव्यू सिर्फ़ पहुँचे हुए ऑर्डर पर दे सकते हैं",
  "err.reviewExists": "इस ऑर्डर का रिव्यू पहले ही हो चुका है",
  "err.shopNotFound": "दुकान नहीं मिली",
  "err.providerNotFound": "दुकान नहीं मिली",
  "err.photoTooBig": "फ़ोटो 2 MB से छोटी रखें (JPG, PNG या WebP)",
  "err.photoType": "सिर्फ़ JPG, PNG या WebP फ़ोटो भेजें",
  "err.photoBad": "यह फ़ोटो सही नहीं है। JPG, PNG या WebP भेजें",
  "err.tooManyReviews": "बहुत ज़्यादा रिव्यू, थोड़ी देर बाद कोशिश करें",
  "err.tooManyUploads": "बहुत ज़्यादा फ़ोटो अपलोड, थोड़ी देर बाद कोशिश करें",
  "err.langBad": "भाषा गलत है",
  "err.priceRupees": "दाम रुपये में लिखें (जैसे 85 या 85.50)",
  "err.dayBad": "दिन गलत है",
  "err.itemBad": "आइटम गलत है",
  "err.photoMissing": "फ़ोटो नहीं मिली",
  "err.photoLarge": "फ़ोटो बहुत बड़ी है",
  "err.photoOnly": "सिर्फ़ फ़ोटो चुनें",
  "err.photoOpen": "यह फ़ोटो खुल नहीं पाई। JPG या PNG आज़माएँ।",
  "err.statusConflict": "ऑर्डर अभी \"{from}\" है, इसे \"{to}\" नहीं कर सकते",
};
```

#### web/src/i18n/messages/en.ts

```ts
import type { MessageKey } from "./hinglish";

// English
export const en: Record<MessageKey, string> = {
  "common.loading": "Please wait...",
  "common.save": "Save",
  "common.remove": "Remove",
  "common.edit": "Edit",
  "meta.title": "Tiffin Ghar: home-cooked food in your city",
  "meta.description": "Home-style tiffin shops in your city, today's menu and cash on delivery orders.",
  "nav.myOrders": "My orders",
  "nav.openShop": "Open a shop",
  "nav.login": "Login",
  "nav.logout": "Logout",
  "nav.dashboard": "Dashboard",
  "nav.admin": "Admin",
  "nav.startShop": "Open your shop",
  "nav.website": "Website",
  "nav.home": "Home",
  "nav.back": "Back",
  "nav.language": "Language",
  "footer.tagline": "Home-cooked food in your city. Payment is cash on delivery for now.",
  "home.heroA": "Home-cooked food,",
  "home.heroB": "in your city",
  "home.heroSub": "Find tiffin shops near you, pick today's menu and order from home.",
  "home.searchPlaceholder": "Type your city (like Prayagraj)",
  "home.search": "Search",
  "home.shopsIn": "Shops in {city}",
  "home.noShops": "No open shops found in {city} right now.",
  "home.how": "How it works",
  "home.step1Title": "Pick your city",
  "home.step1Text": "See the open tiffin shops in your city.",
  "home.step2Title": "Today's menu",
  "home.step2Text": "Every shop's food and prices for today in one place.",
  "home.step3Title": "Place your order",
  "home.step3Text": "Order with cash on delivery and get food at home.",
  "home.ctaTitle": "Do you run a tiffin shop?",
  "home.ctaText": "Add your menu, take orders and reach customers in your city.",
  "home.ctaButton": "Open a shop",
  "rating.none": "No ratings yet",
  "rating.count": "({n} reviews)",
  "shop.reviewsLink": "See reviews",
  "shop.todayMenu": "Today's menu ({day})",
  "shop.noItems": "There are no items for today yet.",
  "shop.closed": "This shop is closed or could not be found.",
  "shop.notFound": "This shop could not be found.",
  "of.veg": "Veg",
  "of.nonveg": "Non-veg",
  "of.less": "Decrease",
  "of.more": "Increase",
  "of.loginFirst": "You need to log in to place an order.",
  "of.loginButton": "Log in",
  "of.title": "Your order",
  "of.pick": "Pick items above (tap +).",
  "of.summary": "{count} item(s), total {total} (payment: cash on delivery)",
  "of.addrPh": "Full delivery address",
  "of.notePh": "Note for the shop (optional)",
  "of.submit": "Place order",
  "orders.title": "My orders",
  "orders.loadFail": "Couldn't load orders, please try again later.",
  "orders.empty": "You haven't placed any orders yet.",
  "orders.items": "{n} item(s)",
  "orders.older": "Older orders",
  "orders.notFound": "This order could not be found.",
  "orders.orderLoadFail": "Couldn't load the order, please try again later.",
  "orders.number": "Order #{id}",
  "orders.total": "Total (cash on delivery)",
  "orders.address": "Delivery address: {address}",
  "orders.note": "Note: {note}",
  "orders.cancel": "Cancel order",
  "orders.reviewMine": "Your review",
  "orders.reviewAsk": "How was the food?",
  "review.placeholder": "Write something if you like (optional)",
  "review.submit": "Submit review",
  "review.star": "{n} star",
  "reviews.title": "Reviews",
  "reviews.empty": "There are no reviews yet.",
  "reviews.customer": "Customer {name}",
  "reviews.newer": "Newer reviews",
  "reviews.older": "Older",
  "status.PLACED": "Order received, waiting for the shop",
  "status.ACCEPTED": "The shop accepted it",
  "status.PREPARING": "Being prepared",
  "status.OUT_FOR_DELIVERY": "On the way",
  "status.DELIVERED": "Delivered",
  "status.REJECTED": "The shop declined it",
  "status.CANCELLED": "Cancelled",
  "pstatus.PLACED": "New order",
  "pstatus.ACCEPTED": "Accepted",
  "pstatus.PREPARING": "Preparing",
  "pstatus.OUT_FOR_DELIVERY": "Out for delivery",
  "pstatus.DELIVERED": "Delivered",
  "pstatus.REJECTED": "Declined",
  "pstatus.CANCELLED": "Cancelled by customer",
  "action.ACCEPTED": "Accept",
  "action.REJECTED": "Decline",
  "action.PREPARING": "Preparing",
  "action.OUT_FOR_DELIVERY": "Out for delivery",
  "action.DELIVERED": "Delivered",
  "filter.all": "All",
  "filter.PLACED": "New",
  "filter.ACCEPTED": "Accepted",
  "filter.PREPARING": "Preparing",
  "filter.OUT_FOR_DELIVERY": "On the way",
  "filter.DELIVERED": "Delivered",
  "filter.REJECTED": "Declined",
  "filter.CANCELLED": "Cancelled",
  "day.0": "Sunday",
  "day.1": "Monday",
  "day.2": "Tuesday",
  "day.3": "Wednesday",
  "day.4": "Thursday",
  "day.5": "Friday",
  "day.6": "Saturday",
  "login.title": "Login",
  "login.tabCustomer": "Customer",
  "login.tabProvider": "Shop owner",
  "login.introCustomer": "Log in with your mobile number to order tiffin, you will get an OTP.",
  "login.introProvider": "Log in to manage your tiffin shop. If it's your first time, you'll fill in your shop profile after login.",
  "login.phone": "Mobile number (10 digits)",
  "login.sendOtp": "Send OTP",
  "login.otpFor": "Enter the OTP for {phone}",
  "login.otp": "6-digit OTP",
  "login.verify": "Log in",
  "login.changeNumber": "Change number",
  "dash.tabHome": "Shop",
  "dash.tabMenu": "Menu",
  "dash.tabOrders": "Orders",
  "dash.tabReviews": "Reviews",
  "dash.newText": "Fill in your shop details. Customers will see it once the admin approves.",
  "dash.adminNote": "Admins have a separate panel.",
  "dash.adminPanel": "Open admin panel",
  "dash.profileFail": "Couldn't load the profile, please try again later.",
  "dash.pending": "Waiting for approval. Your shop can open once the admin approves it. You can build your menu meanwhile.",
  "dash.rejected": "Your profile was not approved. Fix the details and talk to the admin.",
  "dash.shopOpen": "Your shop is open (customers can see it)",
  "dash.shopClosed": "Your shop is closed",
  "dash.closeBtn": "Close shop",
  "dash.openBtn": "Open shop",
  "dash.newOrders": "New orders: {n}",
  "dash.ordersHint": "View orders and update their status",
  "dash.address": "Address: {address}",
  "dash.fssai": "FSSAI: {value}",
  "dash.fssaiNone": "not added",
  "dash.editProfile": "Edit profile",
  "dash.photoTitle": "Shop photo",
  "dash.photoHint": "Customers will see this photo on your shop's card.",
  "pf.shopName": "Shop name",
  "pf.city": "City",
  "pf.address": "Full address",
  "pf.pincode": "Pincode (6 digits)",
  "pf.fssai": "FSSAI number (14 digits, leave empty if you don't have it yet)",
  "pf.saved": "Saved.",
  "pf.create": "Create shop profile",
  "menu.title": "My menu",
  "menu.hint": "Customers only see today's menu: items set for today or 'Every day' that are turned on.",
  "menu.added": "Item added.",
  "menu.formAdd": "Add a new item",
  "menu.formEdit": "Edit item",
  "menu.cancelEdit": "Cancel",
  "menu.all": "All items",
  "menu.loadFail": "Couldn't load the menu, please try again later.",
  "menu.empty": "No items yet. Add your first item above.",
  "menu.everyDay": "Every day",
  "menu.on": "On",
  "menu.off": "Off",
  "menu.turnOff": "Turn off",
  "menu.turnOn": "Turn on",
  "menu.confirmDelete": "Remove this item?",
  "item.name": "Dish name",
  "item.desc": "What's in it (optional)",
  "item.price": "Price (in rupees, like 85 or 85.50)",
  "item.day": "Which day",
  "item.veg": "Vegetarian",
  "item.available": "Turned on (visible to customers)",
  "item.add": "Add item",
  "porders.title": "Orders",
  "porders.hint": "This page loads new orders by itself every 30 seconds.",
  "porders.loadFail": "Couldn't load orders, please try again later.",
  "porders.none": "No orders in this filter.",
  "porders.customer": "Customer:",
  "porders.address": "Delivery address: {address}",
  "porders.note": "Note: {note}",
  "porders.total": "Total (cash on delivery, collect from customer)",
  "porders.confirmReject": "Decline this order?",
  "porders.newer": "Newer orders",
  "photo.add": "Add photo",
  "photo.change": "Change photo",
  "photo.uploading": "Uploading...",
  "photo.alt": "Photo",
  "dreviews.pending": "Customer reviews will appear here once your shop is approved.",
  "dreviews.none": "No reviews yet.",
  "err.ownShop": "You can't order from your own shop",
  "err.profileExists": "Your shop profile already exists",
  "err.forbidden": "You are not allowed to do this",
  "err.cannotCancel": "This order can no longer be cancelled",
  "err.tooManyOtpTries": "Too many wrong attempts, request a new OTP",
  "err.qtyMax": "Quantity of one item can't be more than 20",
  "err.badItemId": "Invalid item id",
  "err.badOrderId": "Invalid order id",
  "err.badProviderId": "Invalid shop id",
  "err.itemNotFound": "Item not found",
  "err.badJson": "The data sent is not valid",
  "err.generic": "Something went wrong, please try again later",
  "err.itemsNotInMenu": "Some items are not on today's menu or are turned off",
  "err.loginRequired": "Login is required",
  "err.otpExpired": "OTP has expired, request a new one",
  "err.otpWrong": "Wrong OTP",
  "err.totalTooHigh": "Order total is too high",
  "err.orderNotFound": "Order not found",
  "err.alreadyCancelled": "Order is already cancelled",
  "err.askOtpFirst": "Request an OTP first",
  "err.notApproved": "Profile is not approved yet",
  "err.providerProfileMissing": "Shop profile not found",
  "err.sessionEnded": "Session ended, please log in again",
  "err.slowDown": "Please wait, try again after 1 minute",
  "err.tokenBad": "Token is invalid or expired, please log in again",
  "err.userNotFound": "User not found",
  "err.shopClosed": "This shop is closed or not found",
  "err.routeNotFound": "Route not found",
  "err.itemsBad": "Items are invalid, please reload the page",
  "err.network": "Couldn't reach the server, please try again later",
  "err.badInput": "Invalid input",
  "err.otp6": "Enter the 6-digit OTP",
  "err.pincode6": "Enter a 6-digit pincode",
  "err.priceMin": "Price must be at least ₹1",
  "err.priceNumber": "Enter the price as a number",
  "err.pricePaise": "Price in paise, as a whole number (₹85 = 8500)",
  "err.priceMax": "Price can't be more than ₹10,000",
  "err.addressRequired": "Enter the delivery address",
  "err.dishName": "Enter the dish name",
  "err.shopName": "Enter the shop name",
  "err.itemsMax": "An order can't have more than 20 different items",
  "err.fssai": "FSSAI number has 14 digits",
  "err.itemsList": "Send the list of items",
  "err.itemsMin": "Choose at least one item",
  "err.nothingToChange": "Send something to change",
  "err.limitRange": "Limit must be between 1 and 50",
  "err.noteMax": "Keep the note under 200 characters",
  "err.pageMin": "Page must be 1 or more",
  "err.addressMax": "Keep the address under 250 characters",
  "err.qtyRange": "Quantity must be between 1 and 20",
  "err.qtyNumber": "Enter the quantity as a number",
  "err.refreshBad": "Refresh token is invalid",
  "err.phone10": "Enter a valid 10-digit mobile number",
  "err.idBad": "Send a valid id",
  "err.cityRequired": "Enter the city",
  "err.statusBad": "Invalid status",
  "err.ratingRange": "Choose a rating between 1 and 5",
  "err.reviewMax": "Keep the review under 500 characters",
  "err.reviewNotDelivered": "You can only review delivered orders",
  "err.reviewExists": "This order has already been reviewed",
  "err.shopNotFound": "Shop not found",
  "err.providerNotFound": "Shop not found",
  "err.photoTooBig": "Keep the photo under 2 MB (JPG, PNG or WebP)",
  "err.photoType": "Send only a JPG, PNG or WebP photo",
  "err.photoBad": "This photo is not valid. Send JPG, PNG or WebP",
  "err.tooManyReviews": "Too many reviews, please try again later",
  "err.tooManyUploads": "Too many photo uploads, please try again later",
  "err.langBad": "Invalid language",
  "err.priceRupees": "Enter the price in rupees (like 85 or 85.50)",
  "err.dayBad": "Invalid day",
  "err.itemBad": "Invalid item",
  "err.photoMissing": "Photo not found",
  "err.photoLarge": "Photo is too large",
  "err.photoOnly": "Please choose a photo",
  "err.photoOpen": "This photo couldn't be opened. Try a JPG or PNG.",
  "err.statusConflict": "The order is currently \"{from}\", it can't be changed to \"{to}\"",
};
```

#### web/src/components/language-switcher.tsx

```tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/config";
import { setLanguageAction } from "@/i18n/actions";
import { useT } from "@/i18n/client";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={t("nav.language")}
      value={locale}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await setLanguageAction(next);
          router.refresh();
        });
      }}
      className="rounded border bg-white px-2 py-1 text-sm"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABEL[l]}
        </option>
      ))}
    </select>
  );
}
```

#### web/src/components/site-header.tsx

```tsx
import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/login/actions";
import { getT } from "@/i18n/server";
import DashboardLink from "@/components/dashboard-link";
import LanguageSwitcher from "@/components/language-switcher";
import Logo from "@/components/logo";

export default async function SiteHeader() {
  const session = await getSession();
  const user = session.status === "user" ? session.user : null;
  const { t, locale } = await getT();

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="Tiffin Ghar">
          <Logo />
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <LanguageSwitcher locale={locale} />
          {user ? (
            <>
              <Link href="/orders" className="hover:text-orange-600">
                {t("nav.myOrders")}
              </Link>
              <DashboardLink />
              <span className="hidden text-gray-500 sm:inline">{user.phone}</span>
              <form action={logoutAction}>
                <button className="rounded border px-3 py-1 hover:bg-orange-50">{t("nav.logout")}</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login?as=provider" className="hover:text-orange-600">
                {t("nav.openShop")}
              </Link>
              <Link
                href="/login"
                className="rounded bg-orange-600 px-3 py-1.5 font-medium text-white hover:bg-orange-700"
              >
                {t("nav.login")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

#### web/src/components/site-footer.tsx

```tsx
import { getT } from "@/i18n/server";

export default async function SiteFooter() {
  const { t } = await getT();

  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-500">
        <p className="font-semibold text-gray-700">Tiffin Ghar</p>
        <p className="mt-1">{t("footer.tagline")}</p>
      </div>
    </footer>
  );
}
```

#### web/src/components/dashboard-link.tsx

```tsx
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getT } from "@/i18n/server";

// Header me: provider ko "Dashboard", admin ko "Admin", customer ko "Apni dukaan kholo"
export default async function DashboardLink() {
  const session = await getSession();
  if (session.status !== "user") return null;

  const { t } = await getT();
  const role = session.user.role;
  const href = role === "ADMIN" ? "/admin" : "/dashboard";
  const label =
    role === "ADMIN" ? t("nav.admin") : role === "PROVIDER" ? t("nav.dashboard") : t("nav.startShop");

  return (
    <Link href={href} className="text-orange-600">
      {label}
    </Link>
  );
}
```

#### web/src/components/stars.tsx

```tsx
import { getT } from "@/i18n/server";

export function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span aria-label={`${value} / 5`} className="text-orange-500">
      {"★".repeat(full)}
      <span className="text-gray-300">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export async function RatingLine({ rating, count }: { rating: number | null; count: number }) {
  const { t } = await getT();

  if (!rating || count === 0) {
    return <span className="text-sm text-gray-500">{t("rating.none")}</span>;
  }
  return (
    <span className="text-sm">
      <Stars value={rating} /> <span className="font-semibold">{rating}</span>{" "}
      <span className="text-gray-500">{t("rating.count", { n: count })}</span>
    </span>
  );
}
```

#### web/src/components/dash-nav.tsx

```tsx
import Link from "next/link";
import { getT } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages/hinglish";

const TABS: { key: "home" | "menu" | "orders" | "reviews"; href: string; label: MessageKey }[] = [
  { key: "home", href: "/dashboard", label: "dash.tabHome" },
  { key: "menu", href: "/dashboard/menu", label: "dash.tabMenu" },
  { key: "orders", href: "/dashboard/orders", label: "dash.tabOrders" },
  { key: "reviews", href: "/dashboard/reviews", label: "dash.tabReviews" },
];

export default async function DashNav({
  active,
}: {
  active: "home" | "menu" | "orders" | "reviews";
}) {
  const { t } = await getT();

  return (
    <nav className="flex flex-wrap items-center gap-2 border-b pb-3">
      <Link href="/" className="mr-2 text-orange-600">
        &larr; {t("nav.website")}
      </Link>
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            tab.key === active
              ? "rounded bg-orange-600 px-3 py-1 text-white"
              : "rounded border px-3 py-1 hover:bg-orange-50"
          }
        >
          {t(tab.label)}
        </Link>
      ))}
    </nav>
  );
}
```

#### web/src/components/photo-uploader.tsx

```tsx
"use client";

import { useActionState, useRef, useState, useTransition, type ChangeEvent } from "react";
import { removePhotoAction, uploadPhotoAction, type PhotoState } from "@/app/dashboard/actions";
import Thumb from "@/components/thumb";
import { useT } from "@/i18n/client";

const initial: PhotoState = { error: "" };
const MAX_BYTES = 850_000;

// Badi photo ko 1200px me chhota karke JPG banata hai
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  for (const q of [0.85, 0.7, 0.55, 0.4]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", q));
    if (blob && blob.size <= MAX_BYTES) return blob;
  }
  throw new Error("big");
}

export default function PhotoUploader({
  kind,
  itemId,
  src,
}: {
  kind: "shop" | "menu";
  itemId?: number;
  src: string | null;
}) {
  const t = useT();
  const [upState, upload, uploading] = useActionState(uploadPhotoAction, initial);
  const [rmState, remove, removing] = useActionState(removePhotoAction, initial);
  const [localError, setLocalError] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // wahi photo dobara chun sako
    if (!file) return;

    setLocalError("");
    if (!file.type.startsWith("image/")) {
      setLocalError(t("err.photoOnly"));
      return;
    }

    try {
      const blob = await compress(file);
      const fd = new FormData();
      fd.set("kind", kind);
      if (itemId) fd.set("id", String(itemId));
      fd.set("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      startTransition(() => upload(fd));
    } catch {
      setLocalError(t("err.photoOpen"));
    }
  }

  const error = localError || upState.error || rmState.error;

  return (
    <div className="flex items-center gap-3">
      <Thumb src={src} alt={t("photo.alt")} className="h-20 w-20 shrink-0 rounded-lg" />

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || removing}
            className="rounded border px-3 py-1 text-sm hover:bg-orange-50 disabled:opacity-50"
          >
            {uploading ? t("photo.uploading") : src ? t("photo.change") : t("photo.add")}
          </button>

          {src && (
            <form action={remove}>
              <input type="hidden" name="kind" value={kind} />
              {itemId && <input type="hidden" name="id" value={itemId} />}
              <button
                disabled={uploading || removing}
                className="rounded border border-red-600 px-3 py-1 text-sm text-red-600 disabled:opacity-50"
              >
                {removing ? t("common.loading") : t("common.remove")}
              </button>
            </form>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
```

#### web/src/lib/format.ts

```ts
import type { Locale } from "@/i18n/config";

const INTL_LOCALE: Record<Locale, string> = {
  hinglish: "en-IN",
  hi: "hi-IN",
  en: "en-IN",
};

// Paise ko rupaye me dikhao: 8500 -> ₹85
export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

// Tareekh user ki bhasha me (locale na do to purane jaisa)
export function formatDate(iso: string, locale: Locale = "hinglish") {
  return new Date(iso).toLocaleString(INTL_LOCALE[locale], {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
```

#### web/src/lib/orders.ts

```ts
import type { MessageKey } from "@/i18n/messages/hinglish";

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

// Customer ko status ka text (bhasha ki key): t(STATUS_KEY[order.status])
export const STATUS_KEY: Record<OrderStatus, MessageKey> = {
  PLACED: "status.PLACED",
  ACCEPTED: "status.ACCEPTED",
  PREPARING: "status.PREPARING",
  OUT_FOR_DELIVERY: "status.OUT_FOR_DELIVERY",
  DELIVERED: "status.DELIVERED",
  REJECTED: "status.REJECTED",
  CANCELLED: "status.CANCELLED",
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
  review: { rating: number; comment: string | null } | null;
};
```

#### web/src/lib/provider.ts

```ts
import type { MessageKey } from "@/i18n/messages/hinglish";
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
  photoUrl: string | null;
};

export type DashMenuItem = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  dayOfWeek: number | null;
  isVeg: boolean;
  isAvailable: boolean;
  photoUrl: string | null;
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

// 0 = Ravivar ... 6 = Shanivar (bhasha ki keys)
export const DAY_KEYS: MessageKey[] = [
  "day.0",
  "day.1",
  "day.2",
  "day.3",
  "day.4",
  "day.5",
  "day.6",
];

// Provider ko status aise dikhte hain
export const PROVIDER_STATUS_KEY: Record<OrderStatus, MessageKey> = {
  PLACED: "pstatus.PLACED",
  ACCEPTED: "pstatus.ACCEPTED",
  PREPARING: "pstatus.PREPARING",
  OUT_FOR_DELIVERY: "pstatus.OUT_FOR_DELIVERY",
  DELIVERED: "pstatus.DELIVERED",
  REJECTED: "pstatus.REJECTED",
  CANCELLED: "pstatus.CANCELLED",
};

export type NextStatus = "ACCEPTED" | "REJECTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";

// Backend ke ALLOWED_FROM jaisa hi: kis status se aage kya ho sakta hai
export const NEXT_STATUSES: Partial<Record<OrderStatus, NextStatus[]>> = {
  PLACED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING", "REJECTED"],
  PREPARING: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export const ACTION_KEY: Record<NextStatus, MessageKey> = {
  ACCEPTED: "action.ACCEPTED",
  REJECTED: "action.REJECTED",
  PREPARING: "action.PREPARING",
  OUT_FOR_DELIVERY: "action.OUT_FOR_DELIVERY",
  DELIVERED: "action.DELIVERED",
};

export const FILTERS: { value: OrderStatus | ""; key: MessageKey }[] = [
  { value: "", key: "filter.all" },
  { value: "PLACED", key: "filter.PLACED" },
  { value: "ACCEPTED", key: "filter.ACCEPTED" },
  { value: "PREPARING", key: "filter.PREPARING" },
  { value: "OUT_FOR_DELIVERY", key: "filter.OUT_FOR_DELIVERY" },
  { value: "DELIVERED", key: "filter.DELIVERED" },
  { value: "REJECTED", key: "filter.REJECTED" },
  { value: "CANCELLED", key: "filter.CANCELLED" },
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

#### web/src/app/layout.tsx

```tsx
import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { HTML_LANG } from "@/i18n/config";
import { I18nProvider } from "@/i18n/client";
import { getT } from "@/i18n/server";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Hindi (Devanagari) ke liye
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: { default: t("meta.title"), template: "%s | Tiffin Ghar" },
    description: t("meta.description"),
  };
}

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, messages } = await getT();

  return (
    <html lang={HTML_LANG[locale]} className={`${poppins.variable} ${devanagari.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <I18nProvider locale={locale} messages={messages}>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
```

#### web/src/app/page.tsx

```tsx
import Link from "next/link";
import { getProviders, type Provider } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { photoSrc } from "@/lib/photo";
import { getT } from "@/i18n/server";
import { translateError } from "@/i18n/errors";
import { RatingLine } from "@/components/stars";
import Thumb from "@/components/thumb";

const CITIES = ["Prayagraj", "Lucknow", "Varanasi", "Kanpur", "Delhi", "Mumbai"];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const query = city?.trim();
  const { t } = await getT();

  // Login purana ho to naya token yahin le liya jata hai
  const here = query ? `/?city=${encodeURIComponent(query)}` : "/";
  await getCurrentUser(here);

  let providers: Provider[] | null = null;
  let error = "";

  if (query) {
    try {
      providers = (await getProviders(query)).items;
    } catch (e) {
      error = e instanceof Error ? translateError(t, e.message) : t("err.generic");
    }
  }

  const steps = [
    { icon: "📍", title: t("home.step1Title"), text: t("home.step1Text") },
    { icon: "🍛", title: t("home.step2Title"), text: t("home.step2Text") },
    { icon: "🛵", title: t("home.step3Title"), text: t("home.step3Text") },
  ];

  return (
    <main>
      <section className="bg-gradient-to-b from-orange-100 to-[#fffaf5]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">
            {t("home.heroA")} <span className="text-orange-600">{t("home.heroB")}</span>
          </h1>
          <p className="mt-3 max-w-xl text-gray-600">{t("home.heroSub")}</p>

          <form className="mt-6 flex max-w-xl gap-2">
            <input
              name="city"
              defaultValue={query}
              placeholder={t("home.searchPlaceholder")}
              className="flex-1 rounded-lg border bg-white px-4 py-3 shadow-sm"
            />
            <button className="rounded-lg bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-700">
              {t("home.search")}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Link
                key={c}
                href={`/?city=${encodeURIComponent(c)}`}
                className="rounded-full border bg-white px-3 py-1 text-sm hover:bg-orange-50"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-6">
        {error && <p className="text-red-600">{error}</p>}

        {providers && (
          <>
            <h2 className="text-xl font-semibold">
              {t("home.shopsIn", { city: query ?? "" })}
              {providers.length > 0 && ` (${providers.length})`}
            </h2>

            {providers.length === 0 && (
              <p className="mt-4 text-gray-600">{t("home.noShops", { city: query ?? "" })}</p>
            )}

            {providers.length > 0 && (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/provider/${p.id}`}
                      className="block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
                    >
                      <Thumb src={photoSrc(p.photoUrl)} alt={p.shopName} className="h-40 w-full" />
                      <div className="p-4">
                        <p className="text-lg font-semibold">{p.shopName}</p>
                        <p className="text-sm text-gray-600">
                          {p.city} - {p.pincode}
                        </p>
                        <div className="mt-1">
                          <RatingLine rating={p.rating} count={p.ratingCount} />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {!providers && !error && (
          <>
            <h2 className="text-xl font-semibold">{t("home.how")}</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {steps.map((s) => (
                <li key={s.title} className="rounded-xl border bg-white p-5 shadow-sm">
                  <p className="text-3xl">{s.icon}</p>
                  <p className="mt-2 font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{s.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-10 rounded-2xl bg-orange-600 p-6 text-white sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">{t("home.ctaTitle")}</p>
            <p className="mt-1 text-sm text-orange-100">{t("home.ctaText")}</p>
          </div>
          <Link
            href="/login?as=provider"
            className="mt-4 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-orange-700 sm:mt-0"
          >
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>
    </main>
  );
}
```

#### web/src/app/login/page.tsx

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, safeNext } from "@/lib/session";
import { getT } from "@/i18n/server";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; as?: string }>;
}) {
  const { next, as } = await searchParams;
  const nextPath = safeNext(next);
  const { t } = await getT();

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
        &larr; {t("nav.back")}
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{t("login.title")}</h1>

      <div className="mt-4 flex gap-2">
        <Link href={`/login?as=customer${keep}`} className={tab("customer")}>
          {t("login.tabCustomer")}
        </Link>
        <Link href={`/login?as=provider${keep}`} className={tab("provider")}>
          {t("login.tabProvider")}
        </Link>
      </div>

      <p className="mt-4 text-gray-600">
        {role === "provider" ? t("login.introProvider") : t("login.introCustomer")}
      </p>

      <LoginForm key={role} next={target} />
    </main>
  );
}
```

#### web/src/app/login/LoginForm.tsx

```tsx
"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { useT } from "@/i18n/client";

const initial: LoginState = { step: "phone", phone: "", error: "" };
const field = "mt-1 w-full rounded-lg border bg-white px-3 py-2";

export default function LoginForm({ next }: { next: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="next" value={next} />

      {state.step === "phone" ? (
        <>
          <label className="block text-sm">
            {t("login.phone")}
            <input
              name="phone"
              defaultValue={state.phone}
              required
              inputMode="numeric"
              autoComplete="tel"
              pattern="\d{10}"
              maxLength={10}
              className={field}
            />
          </label>

          <button
            disabled={pending}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {pending ? t("common.loading") : t("login.sendOtp")}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">{t("login.otpFor", { phone: state.phone })}</p>

          <label className="block text-sm">
            {t("login.otp")}
            <input
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              className={field}
            />
          </label>

          <button
            disabled={pending}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {pending ? t("common.loading") : t("login.verify")}
          </button>

          <button
            name="intent"
            value="back"
            formNoValidate
            disabled={pending}
            className="w-full rounded-lg border px-4 py-2.5 hover:bg-orange-50"
          >
            {t("login.changeNumber")}
          </button>
        </>
      )}

      {state.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}
```

#### web/src/app/login/actions.ts

```ts
"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { clearSession, getRefreshToken, safeNext, setSession } from "@/lib/session";
import { translateError } from "@/i18n/errors";
import { getT } from "@/i18n/server";
import { syncLanguageAfterLogin } from "@/i18n/sync";

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
  const { t } = await getT();

  // "Number badlo" button
  if (formData.get("intent") === "back") {
    return { step: "phone", phone: prev.phone, error: "" };
  }

  // Step 1: OTP maango
  if (prev.step === "phone") {
    const phone = String(formData.get("phone") ?? "").trim();
    const result = await callApi<unknown>("/auth/send-otp", { phone });
    if (!result.ok) return { step: "phone", phone, error: translateError(t, result.error) };
    return { step: "otp", phone, error: "" };
  }

  // Step 2: OTP check karo
  const code = String(formData.get("code") ?? "").trim();
  const next = safeNext(String(formData.get("next") ?? "/"));

  const result = await callApi<VerifyResponse>("/auth/verify-otp", {
    phone: prev.phone,
    code,
  });
  if (!result.ok) {
    return { step: "otp", phone: prev.phone, error: translateError(t, result.error) };
  }

  await setSession(result.data.accessToken, result.data.refreshToken);
  await syncLanguageAfterLogin(result.data.accessToken);
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

#### web/src/app/provider/[id]/page.tsx

```tsx
import Link from "next/link";
import { getMenu } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { photoSrc } from "@/lib/photo";
import { DAY_KEYS } from "@/lib/provider";
import { getT } from "@/i18n/server";
import { RatingLine } from "@/components/stars";
import Thumb from "@/components/thumb";
import OrderForm from "./order-form";

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const user = await getCurrentUser(`/provider/${id}`);
  const data = await getMenu(id);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; {t("nav.back")}
        </Link>
        <p className="mt-6 text-gray-600">{t("shop.closed")}</p>
      </main>
    );
  }

  const { provider, day, items } = data;
  const menuItems = items.map((i) => ({ ...i, photo: photoSrc(i.photoUrl) }));

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href={`/?city=${encodeURIComponent(provider.city)}`} className="text-orange-600">
        &larr; {t("home.shopsIn", { city: provider.city })}
      </Link>

      <Thumb
        src={photoSrc(provider.photoUrl)}
        alt={provider.shopName}
        className="mt-4 h-48 w-full rounded-2xl sm:h-60"
      />

      <h1 className="mt-4 text-3xl font-bold">{provider.shopName}</h1>
      <p className="text-gray-600">
        {provider.city} - {provider.pincode}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <RatingLine rating={provider.rating} count={provider.ratingCount} />
        <Link href={`/provider/${provider.id}/reviews`} className="text-sm text-orange-600">
          {t("shop.reviewsLink")}
        </Link>
      </div>

      <h2 className="mt-6 text-xl font-semibold">
        {t("shop.todayMenu", { day: t(DAY_KEYS[day]) })}
      </h2>

      {menuItems.length === 0 ? (
        <p className="mt-4 text-gray-600">{t("shop.noItems")}</p>
      ) : (
        <OrderForm providerId={provider.id} items={menuItems} loggedIn={!!user} />
      )}
    </main>
  );
}
```

#### web/src/app/provider/[id]/order-form.tsx

```tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { placeOrderAction, type OrderState } from "./actions";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n/client";
import Thumb from "@/components/thumb";

type Item = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
  photo: string | null;
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
  const t = useT();
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
          <li key={item.id} className="flex gap-4 rounded-xl border bg-white p-3 shadow-sm">
            <Thumb src={item.photo} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg" />

            <div className="flex flex-1 items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  <span
                    className={item.isVeg ? "text-green-600" : "text-red-600"}
                    title={item.isVeg ? t("of.veg") : t("of.nonveg")}
                  >
                    &#9679;
                  </span>{" "}
                  {item.name}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
                <p className="mt-1 font-semibold text-orange-700">{formatPrice(item.pricePaise)}</p>
              </div>

              {loggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => change(item.id, -1)}
                    className="h-8 w-8 rounded-full border hover:bg-orange-50"
                    aria-label={t("of.less")}
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{qty[item.id] ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => change(item.id, 1)}
                    className="h-8 w-8 rounded-full bg-orange-600 text-white hover:bg-orange-700"
                    aria-label={t("of.more")}
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
        <p className="mt-6 rounded-xl border bg-white p-4">
          {t("of.loginFirst")}{" "}
          <Link
            href={`/login?next=${encodeURIComponent(`/provider/${providerId}`)}`}
            className="text-orange-600"
          >
            {t("of.loginButton")}
          </Link>
        </p>
      )}

      {loggedIn && items.length > 0 && (
        <form action={action} className="mt-6 space-y-3 rounded-xl border bg-white p-4 shadow-sm">
          <input type="hidden" name="providerId" value={providerId} />
          <input type="hidden" name="items" value={JSON.stringify(lines)} />

          <h3 className="text-lg font-semibold">{t("of.title")}</h3>
          {lines.length === 0 ? (
            <p className="text-sm text-gray-600">{t("of.pick")}</p>
          ) : (
            <p className="text-sm text-gray-600">
              {t("of.summary", { count: lines.length, total: formatPrice(total) })}
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
            placeholder={t("of.addrPh")}
            className="w-full rounded-lg border px-3 py-2"
          />
          <input
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder={t("of.notePh")}
            className="w-full rounded-lg border px-3 py-2"
          />

          <button
            disabled={pending || lines.length === 0}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {pending ? t("common.loading") : t("of.submit")}
          </button>

          {state.error && <p className="text-red-600">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
```

#### web/src/app/provider/[id]/actions.ts

```ts
"use server";

import { redirect } from "next/navigation";
import { authedFetch } from "@/lib/authed";
import { apiError, getT } from "@/i18n/server";

export type OrderState = { error: string };

export async function placeOrderAction(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const { t } = await getT();

  const providerId = Number(formData.get("providerId"));
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "");
  const note = String(formData.get("note") ?? "");

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: t("err.itemsBad") };
  }

  const res = await authedFetch("/orders", {
    mode: "action",
    returnTo: `/provider/${providerId}`,
    method: "POST",
    body: { providerId, items, deliveryAddress, note: note || undefined },
  });

  if (!res.ok) return { error: await apiError(res) };

  const data = await res.json();
  redirect(`/orders/${data.id}`);
}
```

#### web/src/app/provider/[id]/reviews/page.tsx

```tsx
import Link from "next/link";
import { getReviews } from "@/lib/reviews";
import { formatDate } from "@/lib/format";
import { getT } from "@/i18n/server";
import { RatingLine, Stars } from "@/components/stars";

const LIMIT = 20;

export default async function ProviderReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { t, locale } = await getT();

  const data = await getReviews(id, page, LIMIT);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; {t("nav.back")}
        </Link>
        <p className="mt-6 text-gray-600">{t("shop.notFound")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href={`/provider/${data.provider.id}`} className="text-orange-600">
        &larr; {data.provider.shopName}
      </Link>

      <h1 className="mt-4 text-2xl font-bold">{t("reviews.title")}</h1>
      <p className="mt-1">
        <RatingLine rating={data.provider.rating} count={data.provider.ratingCount} />
      </p>

      {data.items.length === 0 && <p className="mt-6 text-gray-600">{t("reviews.empty")}</p>}

      <ul className="mt-6 space-y-3">
        {data.items.map((r) => (
          <li key={r.id} className="rounded border bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <Stars value={r.rating} />
              <span className="text-xs text-gray-500">{formatDate(r.createdAt, locale)}</span>
            </div>
            {r.comment && <p className="mt-2">{r.comment}</p>}
            <p className="mt-2 text-xs text-gray-500">{t("reviews.customer", { name: r.customer })}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between">
        {page > 1 ? (
          <Link href={`/provider/${data.provider.id}/reviews?page=${page - 1}`} className="text-orange-600">
            &larr; {t("reviews.newer")}
          </Link>
        ) : (
          <span />
        )}
        {data.total > page * LIMIT && (
          <Link href={`/provider/${data.provider.id}/reviews?page=${page + 1}`} className="text-orange-600">
            {t("reviews.older")} &rarr;
          </Link>
        )}
      </div>
    </main>
  );
}
```

#### web/src/app/orders/page.tsx

```tsx
import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_KEY, type Order } from "@/lib/orders";
import { getT } from "@/i18n/server";

const LIMIT = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { t, locale } = await getT();

  const res = await authedFetch(`/orders?page=${page}&limit=${LIMIT}`, {
    mode: "page",
    returnTo: page > 1 ? `/orders?page=${page}` : "/orders",
  });

  const data = res.ok ? ((await res.json()) as { items: Order[]; total: number }) : null;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; {t("nav.home")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t("orders.title")}</h1>

      {!data && <p className="mt-4 text-red-600">{t("orders.loadFail")}</p>}

      {data && data.items.length === 0 && (
        <p className="mt-4 text-gray-600">{t("orders.empty")}</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-3">
          {data.items.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="block rounded-xl border bg-white p-4 shadow-sm hover:bg-orange-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{o.provider.shopName}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(o.createdAt, locale)} - {t("orders.items", { n: o.items.length })}
                    </p>
                    <p className="mt-1 text-sm">{t(STATUS_KEY[o.status])}</p>
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
            {t("orders.older")} &rarr;
          </Link>
        </p>
      )}
    </main>
  );
}
```

#### web/src/app/orders/actions.ts

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch } from "@/lib/authed";
import { apiError } from "@/i18n/server";

export type ReviewState = { error: string };

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

export async function submitReviewAction(_prev: ReviewState, fd: FormData): Promise<ReviewState> {
  const id = String(fd.get("id") ?? "");
  if (!/^\d{1,10}$/.test(id)) redirect("/orders");

  const rating = Number(String(fd.get("rating") ?? ""));
  const comment = String(fd.get("comment") ?? "").trim();

  const res = await authedFetch(`/orders/${id}/review`, {
    mode: "action",
    returnTo: `/orders/${id}`,
    method: "POST",
    body: { rating, comment: comment || undefined },
  });

  if (!res.ok) return { error: await apiError(res) };

  revalidatePath(`/orders/${id}`);
  redirect(`/orders/${id}`);
}
```

#### web/src/app/orders/[id]/page.tsx

```tsx
import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_KEY, type Order } from "@/lib/orders";
import { getT } from "@/i18n/server";
import AutoRefresh from "@/components/auto-refresh";
import { Stars } from "@/components/stars";
import { cancelOrderAction } from "../actions";
import ReviewForm from "./review-form";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getT();

  const res = await authedFetch(`/orders/${encodeURIComponent(id)}`, {
    mode: "page",
    returnTo: `/orders/${id}`,
  });

  if (res.status === 404 || res.status === 400) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/orders" className="text-orange-600">
          &larr; {t("orders.title")}
        </Link>
        <p className="mt-6 text-gray-600">{t("orders.notFound")}</p>
      </main>
    );
  }

  if (!res.ok) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/orders" className="text-orange-600">
          &larr; {t("orders.title")}
        </Link>
        <p className="mt-6 text-red-600">{t("orders.orderLoadFail")}</p>
      </main>
    );
  }

  const order = (await res.json()) as Order;

  return (
    <main className="mx-auto max-w-2xl p-6">
      {["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status) && (
        <AutoRefresh seconds={15} />
      )}

      <Link href="/orders" className="text-orange-600">
        &larr; {t("orders.title")}
      </Link>

      <h1 className="mt-4 text-2xl font-bold">{t("orders.number", { id: order.id })}</h1>
      <p className="text-gray-600">
        {order.provider.shopName} - {formatDate(order.createdAt, locale)}
      </p>

      <p className="mt-4 rounded border bg-white p-3 font-semibold">{t(STATUS_KEY[order.status])}</p>

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
        <span>{t("orders.total")}</span>
        <span>{formatPrice(order.totalPaise)}</span>
      </p>

      <div className="mt-6 text-sm text-gray-600">
        <p>{t("orders.address", { address: order.deliveryAddress })}</p>
        {order.note && <p className="mt-1">{t("orders.note", { note: order.note })}</p>}
      </div>

      {order.status === "PLACED" && (
        <form action={cancelOrderAction} className="mt-6">
          <input type="hidden" name="id" value={order.id} />
          <button className="rounded border border-red-600 px-4 py-2 text-red-600">
            {t("orders.cancel")}
          </button>
        </form>
      )}

      {order.status === "DELIVERED" && (
        <div className="mt-8 rounded-xl border bg-white p-4">
          {order.review ? (
            <>
              <p className="font-semibold">{t("orders.reviewMine")}</p>
              <p className="mt-1">
                <Stars value={order.review.rating} />
              </p>
              {order.review.comment && (
                <p className="mt-1 text-sm text-gray-600">{order.review.comment}</p>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold">{t("orders.reviewAsk")}</p>
              <ReviewForm orderId={order.id} />
            </>
          )}
        </div>
      )}
    </main>
  );
}
```

#### web/src/app/orders/[id]/review-form.tsx

```tsx
"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type ReviewState } from "../actions";
import { useT } from "@/i18n/client";

const initial: ReviewState = { error: "" };

export default function ReviewForm({ orderId }: { orderId: number }) {
  const t = useT();
  const [state, action, pending] = useActionState(submitReviewAction, initial);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <form action={action} className="mt-3 space-y-3">
      <input type="hidden" name="id" value={orderId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={t("review.star", { n })}
            aria-pressed={rating === n}
            className={n <= rating ? "text-3xl text-orange-500" : "text-3xl text-gray-300"}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder={t("review.placeholder")}
        className="w-full rounded border px-3 py-2"
      />

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button
        disabled={pending || rating === 0}
        className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? t("common.loading") : t("review.submit")}
      </button>
    </form>
  );
}
```

#### web/src/app/dashboard/page.tsx

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { providerFetch } from "@/lib/provider-api";
import type { ProviderProfile } from "@/lib/provider";
import { getReviews } from "@/lib/reviews";
import { photoSrc } from "@/lib/photo";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import PhotoUploader from "@/components/photo-uploader";
import { RatingLine } from "@/components/stars";
import ProfileForm from "./profile-form";
import { toggleOpenAction } from "./actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const { t } = await getT();

  const user = await getCurrentUser("/dashboard");
  if (!user) redirect("/login?next=%2Fdashboard");

  const newProfile = (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; {t("nav.home")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t("nav.startShop")}</h1>
      <p className="mt-1 text-gray-600">{t("dash.newText")}</p>
      <div className="mt-6">
        <ProfileForm mode="create" />
      </div>
    </main>
  );

  if (user.role === "ADMIN") {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; {t("nav.home")}
        </Link>
        <p className="mt-6 text-gray-600">
          {t("dash.adminNote")}{" "}
          <Link href="/admin" className="text-orange-600">
            {t("dash.adminPanel")}
          </Link>
        </p>
      </main>
    );
  }

  if (user.role !== "PROVIDER") return newProfile;

  const res = await providerFetch("/providers/me", {
    mode: "page",
    returnTo: "/dashboard",
  });
  if (res.status === 404) return newProfile;
  if (!res.ok) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <DashNav active="home" />
        <p className="mt-6 text-red-600">{t("dash.profileFail")}</p>
      </main>
    );
  }
  const p = (await res.json()) as ProviderProfile;

  const ordersRes = await providerFetch("/providers/me/orders?status=PLACED&limit=1", {
    mode: "page",
    returnTo: "/dashboard",
  });
  const newOrders = ordersRes.ok ? ((await ordersRes.json()) as { total: number }).total : null;
  const reviews = await getReviews(p.id, 1, 1);

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

      <div className="mt-4 rounded-xl border bg-white p-4">
        <p className="font-semibold">{t("dash.photoTitle")}</p>
        <p className="text-sm text-gray-600">{t("dash.photoHint")}</p>
        <div className="mt-3">
          <PhotoUploader kind="shop" src={photoSrc(p.photoUrl)} />
        </div>
      </div>

      {p.status === "PENDING" && (
        <p className="mt-4 rounded border border-yellow-600 p-3">{t("dash.pending")}</p>
      )}

      {p.status === "REJECTED" && (
        <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{t("dash.rejected")}</p>
      )}

      {p.status === "APPROVED" && (
        <div className="mt-4 rounded-xl border bg-white p-4">
          <p className="font-semibold">{p.isOpen ? t("dash.shopOpen") : t("dash.shopClosed")}</p>
          <form action={toggleOpenAction} className="mt-3">
            <input type="hidden" name="isOpen" value={String(!p.isOpen)} />
            <button
              className={
                p.isOpen
                  ? "rounded border border-red-600 px-4 py-2 text-red-600"
                  : "rounded bg-orange-600 px-4 py-2 text-white"
              }
            >
              {p.isOpen ? t("dash.closeBtn") : t("dash.openBtn")}
            </button>
          </form>
        </div>
      )}

      <Link
        href="/dashboard/orders?status=PLACED"
        className="mt-4 block rounded-xl border bg-white p-4 hover:bg-orange-50"
      >
        <p className="font-semibold">
          {t("dash.newOrders", { n: newOrders === null ? "-" : newOrders })}
        </p>
        <p className="text-sm text-gray-600">{t("dash.ordersHint")} &rarr;</p>
      </Link>

      {reviews && (
        <Link
          href="/dashboard/reviews"
          className="mt-3 block rounded-xl border bg-white p-4 hover:bg-orange-50"
        >
          <p className="font-semibold">{t("reviews.title")}</p>
          <p className="mt-1">
            <RatingLine rating={reviews.provider.rating} count={reviews.provider.ratingCount} />
          </p>
        </Link>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>{t("dash.address", { address: p.address })}</p>
        <p>{t("dash.fssai", { value: p.fssaiNumber ?? t("dash.fssaiNone") })}</p>
      </div>

      <details className="mt-6 rounded-xl border bg-white p-4">
        <summary className="cursor-pointer font-semibold">{t("dash.editProfile")}</summary>
        <div className="mt-4">
          <ProfileForm mode="edit" profile={p} />
        </div>
      </details>
    </main>
  );
}
```

#### web/src/app/dashboard/profile-form.tsx

```tsx
"use client";

import { useActionState, useState } from "react";
import { createProfileAction, updateProfileAction, type FormState } from "./actions";
import { useT } from "@/i18n/client";

type Profile = {
  shopName: string;
  city: string;
  address: string;
  pincode: string;
  fssaiNumber: string | null;
};

const initial: FormState = { error: "" };
const field = "mt-1 w-full rounded border bg-white px-3 py-2";

export default function ProfileForm({
  mode,
  profile,
}: {
  mode: "create" | "edit";
  profile?: Profile;
}) {
  const t = useT();
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
        {t("pf.shopName")}
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
        {t("pf.city")}
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
        {t("pf.address")}
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
        {t("pf.pincode")}
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
        {t("pf.fssai")}
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
      {state.saved && !state.error && <p className="text-green-600">{t("pf.saved")}</p>}

      <button disabled={pending} className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50">
        {pending ? t("common.loading") : mode === "create" ? t("pf.create") : t("common.save")}
      </button>
    </form>
  );
}
```

#### web/src/app/dashboard/actions.ts

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch, refreshInline } from "@/lib/authed";
import { providerFetch } from "@/lib/provider-api";
import { rupeesToPaise } from "@/lib/provider";
import { uploadImage } from "@/lib/upload";
import { apiError, getT } from "@/i18n/server";
import type { Translator } from "@/i18n/translate";

export type FormState = { error: string; saved?: boolean };

const NEXT_STATUS_LIST = ["ACCEPTED", "REJECTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
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
  if (!res.ok) return { error: await apiError(res) };

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
  if (!res.ok) return { error: await apiError(res) };

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
  if (!res.ok) redirect(withNotice("/dashboard", await apiError(res)));
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

function readMenuForm(fd: FormData, forUpdate: boolean, t: Translator): MenuForm {
  const price = rupeesToPaise(text(fd, "price"));
  if (price === null) {
    return { error: t("err.priceRupees"), body: null };
  }

  const day = text(fd, "dayOfWeek");
  if (day !== "" && !/^[0-6]$/.test(day)) {
    return { error: t("err.dayBad"), body: null };
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
  const { t } = await getT();
  const parsed = readMenuForm(fd, false, t);
  if (!parsed.body) return { error: parsed.error };

  const res = await providerFetch("/providers/me/menu", {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "POST",
    body: parsed.body,
  });
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath("/dashboard/menu");
  // ?added=... se form naya khali ban jata hai (page par key badalti hai)
  redirect(`/dashboard/menu?added=${Date.now()}`);
}

export async function updateMenuItemAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { t } = await getT();
  const id = text(fd, "id");
  if (!/^\d{1,10}$/.test(id)) return { error: t("err.itemBad") };

  const parsed = readMenuForm(fd, true, t);
  if (!parsed.body) return { error: parsed.error };

  const res = await providerFetch(`/providers/me/menu/${id}`, {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "PATCH",
    body: parsed.body,
  });
  if (!res.ok) return { error: await apiError(res) };

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
  if (!res.ok) redirect(withNotice("/dashboard/menu", await apiError(res)));
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
  if (!res.ok) redirect(withNotice("/dashboard/menu", await apiError(res)));
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
  if (!res.ok) redirect(withNotice(back, await apiError(res)));
  redirect(back);
}

// ---------- Photo ----------

export type PhotoState = { error: string };

function photoPath(kind: string, id: string): string | null {
  if (kind === "shop") return "/providers/me/photo";
  if (kind === "menu" && /^\d{1,10}$/.test(id)) return `/providers/me/menu/${id}/photo`;
  return null;
}

export async function uploadPhotoAction(_prev: PhotoState, fd: FormData): Promise<PhotoState> {
  const { t } = await getT();
  const path = photoPath(text(fd, "kind"), text(fd, "id"));
  const file = fd.get("file");
  if (!path || !(file instanceof File) || file.size === 0) return { error: t("err.photoMissing") };
  if (file.size > 900_000) return { error: t("err.photoLarge") };

  const res = await uploadImage(path, await file.arrayBuffer(), file.type || "image/jpeg", "/dashboard");
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  return { error: "" };
}

export async function removePhotoAction(_prev: PhotoState, fd: FormData): Promise<PhotoState> {
  const { t } = await getT();
  const path = photoPath(text(fd, "kind"), text(fd, "id"));
  if (!path) return { error: t("err.photoMissing") };

  const res = await providerFetch(path, {
    mode: "action",
    returnTo: "/dashboard",
    method: "DELETE",
  });
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  return { error: "" };
}
```

#### web/src/app/dashboard/menu/page.tsx

```tsx
import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import { DAY_KEYS, type DashMenuItem } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import { photoSrc } from "@/lib/photo";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import ConfirmButton from "@/components/confirm-button";
import PhotoUploader from "@/components/photo-uploader";
import ItemForm from "./item-form";
import { deleteMenuItemAction, toggleAvailableAction } from "../actions";

const small = "rounded border px-3 py-1 text-sm hover:bg-orange-50";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; added?: string; notice?: string }>;
}) {
  const { edit, added, notice } = await searchParams;
  const { t } = await getT();

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

      <h1 className="mt-6 text-2xl font-bold">{t("menu.title")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t("menu.hint")}</p>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {added && !editItem && (
        <p className="mt-4 rounded border border-green-600 p-3 text-green-600">{t("menu.added")}</p>
      )}

      <h2 className="mt-6 text-lg font-semibold">
        {editItem ? t("menu.formEdit") : t("menu.formAdd")}
      </h2>
      <div className="mt-2">
        <ItemForm
          key={editItem ? `edit-${editItem.id}` : `new-${added ?? ""}`}
          item={editItem}
        />
        {editItem && (
          <p className="mt-2">
            <Link href="/dashboard/menu" className="text-orange-600">
              {t("menu.cancelEdit")}
            </Link>
          </p>
        )}
      </div>

      <h2 className="mt-8 text-lg font-semibold">{t("menu.all")}</h2>

      {!items && <p className="mt-4 text-red-600">{t("menu.loadFail")}</p>}
      {items && items.length === 0 && <p className="mt-4 text-gray-600">{t("menu.empty")}</p>}

      {items && items.length > 0 && (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    <span
                      className={item.isVeg ? "text-green-600" : "text-red-600"}
                      title={item.isVeg ? t("of.veg") : t("of.nonveg")}
                    >
                      &#9679;
                    </span>{" "}
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-600">
                    {item.dayOfWeek === null ? t("menu.everyDay") : t(DAY_KEYS[item.dayOfWeek])} -{" "}
                    {item.isAvailable ? t("menu.on") : t("menu.off")}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.pricePaise)}</p>
              </div>

              <div className="mt-3">
                <PhotoUploader kind="menu" itemId={item.id} src={photoSrc(item.photoUrl)} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={toggleAvailableAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="available" value={String(!item.isAvailable)} />
                  <button className={small}>
                    {item.isAvailable ? t("menu.turnOff") : t("menu.turnOn")}
                  </button>
                </form>

                <Link href={`/dashboard/menu?edit=${item.id}`} className={small}>
                  {t("common.edit")}
                </Link>

                <form action={deleteMenuItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton
                    message={t("menu.confirmDelete")}
                    className="rounded border border-red-600 px-3 py-1 text-sm text-red-600"
                  >
                    {t("common.remove")}
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

#### web/src/app/dashboard/menu/item-form.tsx

```tsx
"use client";

import { useActionState, useState } from "react";
import { createMenuItemAction, updateMenuItemAction, type FormState } from "../actions";
import { DAY_KEYS, paiseToRupees, type DashMenuItem } from "@/lib/provider";
import { useT } from "@/i18n/client";

const initial: FormState = { error: "" };
const field = "mt-1 w-full rounded border bg-white px-3 py-2";

export default function ItemForm({ item }: { item?: DashMenuItem }) {
  const t = useT();
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
    <form action={action} className="space-y-3 rounded-xl border bg-white p-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      <label className="block text-sm">
        {t("item.name")}
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
        {t("item.desc")}
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
        {t("item.price")}
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
        {t("item.day")}
        <select name="dayOfWeek" value={day} onChange={(e) => setDay(e.target.value)} className={field}>
          <option value="">{t("menu.everyDay")}</option>
          {DAY_KEYS.map((key, i) => (
            <option key={key} value={i}>
              {t(key)}
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
        {t("item.veg")}
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isAvailable"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
        />
        {t("item.available")}
      </label>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button disabled={pending} className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50">
        {pending ? t("common.loading") : editing ? t("common.save") : t("item.add")}
      </button>
    </form>
  );
}
```

#### web/src/app/dashboard/orders/page.tsx

```tsx
import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import {
  ACTION_KEY,
  FILTERS,
  NEXT_STATUSES,
  PROVIDER_STATUS_KEY,
  type ProviderOrder,
} from "@/lib/provider";
import type { OrderStatus } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { getT } from "@/i18n/server";
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
  const { t, locale } = await getT();

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

      <h1 className="mt-6 text-2xl font-bold">{t("porders.title")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t("porders.hint")}</p>

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
            {t(f.key)}
          </Link>
        ))}
      </div>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {!data && <p className="mt-4 text-red-600">{t("porders.loadFail")}</p>}
      {data && data.items.length === 0 && <p className="mt-4 text-gray-600">{t("porders.none")}</p>}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((o) => {
            const next = NEXT_STATUSES[o.status] ?? [];
            return (
              <li key={o.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{t("orders.number", { id: o.id })}</p>
                    <p className="text-sm text-gray-600">{formatDate(o.createdAt, locale)}</p>
                  </div>
                  <p className="rounded border px-2 py-1 text-sm font-semibold">
                    {t(PROVIDER_STATUS_KEY[o.status])}
                  </p>
                </div>

                <div className="mt-3 text-sm">
                  <p>
                    {t("porders.customer")}{" "}
                    <a href={`tel:${o.user.phone}`} className="text-orange-600">
                      {o.user.phone}
                    </a>
                  </p>
                  <p className="mt-1">{t("porders.address", { address: o.deliveryAddress })}</p>
                  {o.note && <p className="mt-1">{t("porders.note", { note: o.note })}</p>}
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
                  <span>{t("porders.total")}</span>
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
                          message={s === "REJECTED" ? t("porders.confirmReject") : undefined}
                          className={
                            s === "REJECTED"
                              ? "rounded border border-red-600 px-3 py-2 text-sm text-red-600"
                              : "rounded bg-orange-600 px-3 py-2 text-sm text-white"
                          }
                        >
                          {t(ACTION_KEY[s])}
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
            &larr; {t("porders.newer")}
          </Link>
        ) : (
          <span />
        )}
        {data && data.total > page * LIMIT && (
          <Link href={pathFor(status, page + 1)} className="text-orange-600">
            {t("orders.older")} &rarr;
          </Link>
        )}
      </div>
    </main>
  );
}
```

#### web/src/app/dashboard/reviews/page.tsx

```tsx
import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import type { ProviderProfile } from "@/lib/provider";
import { getReviews } from "@/lib/reviews";
import { formatDate } from "@/lib/format";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import { RatingLine, Stars } from "@/components/stars";

const LIMIT = 20;

export default async function DashboardReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const here = page > 1 ? `/dashboard/reviews?page=${page}` : "/dashboard/reviews";
  const { t, locale } = await getT();

  await requireProviderUser(here);

  const res = await providerFetch("/providers/me", { mode: "page", returnTo: here });
  const p = res.ok ? ((await res.json()) as ProviderProfile) : null;
  const data = p ? await getReviews(p.id, page, LIMIT) : null;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <DashNav active="reviews" />

      <h1 className="mt-6 text-2xl font-bold">{t("reviews.title")}</h1>

      {!data && <p className="mt-4 text-gray-600">{t("dreviews.pending")}</p>}

      {data && (
        <>
          <p className="mt-1">
            <RatingLine rating={data.provider.rating} count={data.provider.ratingCount} />
          </p>

          {data.items.length === 0 && <p className="mt-6 text-gray-600">{t("dreviews.none")}</p>}

          <ul className="mt-6 space-y-3">
            {data.items.map((r) => (
              <li key={r.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <Stars value={r.rating} />
                  <span className="text-xs text-gray-500">{formatDate(r.createdAt, locale)}</span>
                </div>
                {r.comment && <p className="mt-2">{r.comment}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  {t("reviews.customer", { name: r.customer })}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between">
            {page > 1 ? (
              <Link href={`/dashboard/reviews?page=${page - 1}`} className="text-orange-600">
                &larr; {t("reviews.newer")}
              </Link>
            ) : (
              <span />
            )}
            {data.total > page * LIMIT && (
              <Link href={`/dashboard/reviews?page=${page + 1}`} className="text-orange-600">
                {t("reviews.older")} &rarr;
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}
```

## 14. Tests: Batch C (review), Design (look, photo), Bhasha

Login ke saare commands (`$access` provider `8888888888`, `$access2` customer `9999999999`, `$accessA` admin) section 6 me hain. Har command alag line par. Naya terminal kholne par `$` variables khali ho jate hain, to pehle login dobara.

### 14.1 Taiyari: server, migration, code ki jaanch

Backend aur website dono ke liye (har migration ke baad backend band karke):

```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\backend"
```

```
npx prisma migrate dev --name add_reviews_and_photos
```

```
npx prisma generate
```

(Bhasha step ke liye `--name add_user_language`, section 13.) VS Code me `Ctrl + Shift + P`, `TypeScript: Restart TS Server`. Phir:

```
npx tsc --noEmit
```

```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\web"
```

```
npx tsc --noEmit
```

Dono me kuch print na ho. Phir backend (`npm run dev`) aur website (`npm run dev`). Pehli baar website ko Google se fonts lane me thoda time lagta hai (internet chahiye). Naye files ko VS Code laal dikhaye to `TypeScript: Restart TS Server`, asli jaanch `npx tsc --noEmit` hai.

### 14.2 Naya order aur use `DELIVERED` tak le jana (backend se, review test ke liye)

Customer login (`$access2`) aur provider login (`$access`) section 6 se. Menu dekho aur kisi item ki `id` lo:

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/1/menu | ConvertTo-Json -Depth 5
```

Order ka body (`menuItemId` menu se mili asli id, `providerId` dukaan ki id):

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
$o
```

Aana chahiye `status: PLACED`, `paymentMethod: COD`, `totalPaise`. Provider ke token se status badlo (ek-ek):

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

Ya customer ke orders me se koi purana `DELIVERED` order lo:

```
$list = Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders -Headers @{ Authorization = "Bearer $access2" }
```

```
$list.items | Select-Object id, status
```

```
$o = $list.items | Where-Object { $_.status -eq "DELIVERED" } | Select-Object -First 1
```

```
$oid = $o.id
```

```
$provId = $o.provider.id
```

**Dhyan:** `$pid` naam mat use karo, wo PowerShell ka apna variable hai (process ID), badal nahi sakta (`Cannot overwrite variable PID because it is read-only`). Dukaan ki id ke liye `$provId`.

### 14.3 Review ke backend tests

Bina login ke (aana chahiye `Login zaroori hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/review -Method Post -ContentType "application/json" -Body '{"rating":5}' } catch { $_.ErrorDetails.Message }
```

Galat rating (aana chahiye `Rating 1 se 5 ke beech chuno`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/review -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body '{"rating":6}' } catch { $_.ErrorDetails.Message }
```

Kisi aur ke order par (provider ka token, aana chahiye `Order nahi mila`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/review -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"rating":5}' } catch { $_.ErrorDetails.Message }
```

Pahunche nahi hue order par (agar koi `PLACED` ya `CANCELLED` order ho; aana chahiye `Review sirf pahunche hue order par de sakte ho`):

```
$other = ($list.items | Where-Object { $_.status -ne "DELIVERED" } | Select-Object -First 1).id
```

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$other/review -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body '{"rating":5}' } catch { $_.ErrorDetails.Message }
```

Sahi review (aana chahiye `id`, `rating: 4`, `comment`):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/review -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body '{"rating":4,"comment":"Khana accha tha"}'
```

Dobara usi order par (aana chahiye `Is order ka review pehle hi ho chuka hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid/review -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $access2" } -Body '{"rating":1}' } catch { $_.ErrorDetails.Message }
```

Dukaan ke reviews (bina token ke; `rating`, `ratingCount`, `customer` jaisa `99xxxxxx99`):

```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/$provId/reviews" | ConvertTo-Json -Depth 5
```

Galat aur na mili dukaan (aana chahiye `Galat provider id` aur `Dukaan nahi mili`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/abc/reviews } catch { $_.ErrorDetails.Message }
```

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/9999/reviews } catch { $_.ErrorDetails.Message }
```

Dukaan ki list me rating (aana chahiye `rating`, `ratingCount`, `photoUrl`, aur `ratingSum` **nahi**):

```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers?city=Prayagraj" | ConvertTo-Json -Depth 5
```

Menu route me bhi:

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/$provId/menu | ConvertTo-Json -Depth 5
```

Customer ke order me ab `review` bhi:

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/orders/$oid -Headers @{ Authorization = "Bearer $access2" } | ConvertTo-Json -Depth 6
```

### 14.4 Photo upload ke backend tests

**Path me space ho (`Ravi Kumar patel`) to hamesha double quotes me aur poori command ke saath** (sirf path likhne par PowerShell use program samajhta hai). Photo ka naam, jaise `test.jpg`, tumhari file ka hota hai, 2 MB se chhoti. Pehle dekho photo kahan hai:

```
Get-ChildItem "C:\Users\Ravi Kumar patel\Pictures" -Filter *.jpg
```

Bina login ke (aana chahiye `Login zaroori hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/photo -Method Post -ContentType "image/jpeg" -InFile "C:\Users\Ravi Kumar patel\Pictures\test.jpg" } catch { $_.ErrorDetails.Message }
```

Customer ke token se (aana chahiye `Aapko ye karne ki ijazat nahi hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/photo -Method Post -ContentType "image/jpeg" -Headers @{ Authorization = "Bearer $access2" } -InFile "C:\Users\Ravi Kumar patel\Pictures\test.jpg" } catch { $_.ErrorDetails.Message }
```

Asli photo (aana chahiye `photoUrl` jaise `/uploads/xxxxxxxx-....jpg`). PNG ho to `-ContentType "image/png"`, WebP ho to `image/webp`:

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/photo -Method Post -ContentType "image/jpeg" -Headers @{ Authorization = "Bearer $access" } -InFile "C:\Users\Ravi Kumar patel\Pictures\test.jpg"
```

Server photo ko **random naam** se save karta hai, `test.jpg` naam se nahi. Browser me `http://localhost:5000` ke baad jawab ka poora `photoUrl` daalo (ya `Get-ChildItem "C:\Users\Ravi Kumar patel\tiffin-ghar\backend\uploads"` se naam dekho). `http://localhost:5000/uploads/test.jpg` kholne par `Ye route nahi mila` aana sahi hai.

Nakli photo (text ko jpg bata kar; aana chahiye `Ye photo sahi nahi hai. JPG, PNG ya WebP bhejo`):

```
Set-Content -Path "$env:TEMP\fake.jpg" -Value "hello hello hello hello"
```

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/photo -Method Post -ContentType "image/jpeg" -Headers @{ Authorization = "Bearer $access" } -InFile "$env:TEMP\fake.jpg" } catch { $_.ErrorDetails.Message }
```

3 MB ki badi file (aana chahiye `Photo 2 MB se chhoti rakho (JPG, PNG ya WebP)`):

```
[IO.File]::WriteAllBytes("$env:TEMP\big.jpg", (New-Object byte[] 3000000))
```

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/photo -Method Post -ContentType "image/jpeg" -Headers @{ Authorization = "Bearer $access" } -InFile "$env:TEMP\big.jpg" } catch { $_.ErrorDetails.Message }
```

Galat type (aana chahiye `Sirf JPG, PNG ya WebP photo bhejo`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/photo -Method Post -ContentType "text/plain" -Headers @{ Authorization = "Bearer $access" } -Body "abc" } catch { $_.ErrorDetails.Message }
```

Dish ki photo (`ITEM_ID` ki jagah menu ke kisi item ki id; aana chahiye `photoUrl`):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu/ITEM_ID/photo -Method Post -ContentType "image/jpeg" -Headers @{ Authorization = "Bearer $access" } -InFile "C:\Users\Ravi Kumar patel\Pictures\test.jpg"
```

Na mila item (aana chahiye `Item nahi mila`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu/9999/photo -Method Post -ContentType "image/jpeg" -Headers @{ Authorization = "Bearer $access" } -InFile "C:\Users\Ravi Kumar patel\Pictures\test.jpg" } catch { $_.ErrorDetails.Message }
```

Photo hatana (aana chahiye `photoUrl` null):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/photo -Method Delete -Headers @{ Authorization = "Bearer $access" }
```

Purani file disk se gayi ya nahi (sirf maujooda photos bachni chahiye):

```
Get-ChildItem "C:\Users\Ravi Kumar patel\tiffin-ghar\backend\uploads"
```

### 14.5 Bhasha ke backend tests

Bhasha save (aana chahiye `language: hi`):

```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/me/language -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"language":"hi"}'
```

Galat bhasha (aana chahiye `Bhasha galat hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/me/language -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $access" } -Body '{"language":"fr"}' } catch { $_.ErrorDetails.Message }
```

Bina login ke (aana chahiye `Login zaroori hai`):

```
try { Invoke-RestMethod -Uri http://localhost:5000/api/v1/me/language -Method Patch -ContentType "application/json" -Body '{"language":"hi"}' } catch { $_.ErrorDetails.Message }
```

### 14.6 Website ke tests (browser)

Provider ke liye normal window, customer ke liye Incognito. OTP backend terminal me.

**Review:**
1. Incognito me `9999999999` se login, `/orders` me ek `DELIVERED` order jiska review nahi hua: "Khana kaisa laga?" ka form. Star chuno (button tabhi chalu), comment likho, "Review bhejo". "Aapka review" aur stars dikhein, form hat jaye.
2. `PLACED` ya `CANCELLED` order me review ka box nahi.
3. Home par `Prayagraj` dhundo: dukaan ke card par stars, rating, `(1 review)`. Jis dukaan ka review nahi: "Abhi koi rating nahi".
4. `/provider/<id>`: rating line aur "Reviews dekho". Us par `/provider/<id>/reviews`: review, stars, tareekh, `Customer 99xxxxxx99`.
5. Provider (`8888888888`, Provider tab) ke `/dashboard`: "Reviews" ka card. Upar ke "Reviews" tab me wahi review.
6. Dashboard se dukaan band karo: `/provider/<id>/reviews` phir bhi khule. Dukaan wapas kholo.
7. `npx prisma studio` (backend folder me): `Review` table me row, `Provider` me `ratingSum` aur `ratingCount`, `photoUrl` khali.

**Naya look:**
1. Home: sticky header (logo, Dukaan kholo, Login), hero, shehar ke chips, "kaise kaam karta hai", narangi band, footer. Poppins font, tab me naya logo.
2. Login ke baad header me Mere orders, Dashboard/Admin, phone, Logout.
3. Mobile view: Chrome me `Ctrl + Shift + M`, phone ka size. Header theek se aaye, cards ek ke neeche ek, button chhote na hon. Home, dukaan, dashboard, orders pages.

**Photo upload:**
1. Provider `/dashboard`: "Dukaan ki photo" me "Photo lagao" (phone ki badi photo bhi chalegi). Upload ke baad dikhe. "Photo badlo" aur "Hatao" bhi.
2. `/dashboard/menu`: kisi item par "Photo lagao".
3. Customer (Incognito): home par dukaan ke card par photo. Dukaan ka page: upar bada banner, menu me chhoti photo, `+` aur `-` ke gol button.
4. `.txt` ya `.pdf` chuno: "Sirf photo chuno" ya "Ye photo nahi khul payi. JPG ya PNG try karo."

**Bhasha:**
1. Header me bhasha ka menu (Hinglish, हिन्दी, English). Har bhasha me home, dukaan ka page, order dena, login, orders, dashboard, menu, orders, reviews dekho. Sab text badlna chahiye.
2. Galat OTP: error user ki bhasha me.
3. Page refresh karne par bhasha wahi rahe.
4. Bina login ke Hindi chuno, login karo. `npx prisma studio`: `User` table me us number ki `language` `hi`.
5. Cookie hata kar (ya naye browser me) login karo: bhasha apne aap Hindi khule.
6. Dukaan, dish aur shehar ke naam jaise hain waise rahein.
7. Admin panel Hinglish me hi rahe, baaki sab theek.

### 14.7 Git

`tiffin-ghar` folder se, har step ke baad (Batch C, Design, Bhasha):

```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar"
```

```
git status --short
```

`backend/uploads`, `.env`, `.env.local` list me nahi dikhna chahiye. Phir:

```
git add .
```

```
git commit -m "Batch C: reviews and ratings, photo fields"
```

```
git commit -m "Design step: new look, header and footer, photo upload for shops and dishes"
```

```
git commit -m "Bhasha step: Hinglish, Hindi, English, language saved per user"
```

```
git push
```

(Tumne teeno ek-ek karke commit kiye the, to har wale ke saath ek `git commit`. Zip kholne se pehle `git status --short` saaf rakho, taaki kuch bigade to `git checkout .` se wapas aa sako.)

```
git log --oneline -8
```

Secrets check (list me `.env`, `.env.local`, `uploads` nahi dikhna chahiye):

```
git ls-files | findstr "env uploads"
```

## 15. Agla aur bachi hui cheezein

### Kitna bacha hai

| Step | Kaam |
|---|---|
| 6.6, 6.7 | Provider dashboard, login tab, admin panel, order live status. **Ho gaye.** |
| Batch C | Rating aur review, photo ke fields. **Ho gaya.** |
| Design step | Naya look, header/footer, photo upload (dukaan aur dish). **Ho gaya.** |
| Bhasha step | Hinglish, हिन्दी, English, `User.language`, backend error ka anuvad. **Ho gaya.** |
| **Agla: Mobile app** | React Native (Expo), wahi backend, website jaisa brand. Bhasha ki wahi message files (`i18n/messages`), isliye text dobara nahi likhna padega. Login (OTP), dukaan dekhna, order, mere orders, review, provider ka dashboard. |
| Subscription, wallet, payment | Mahine ka plan (26 din, 5% bachat), wallet, Razorpay. Wallet ke RBI rules kisi expert se. |
| Tracking, notifications, complaints | Live tracking, push notification, complaints, admin ke aur kaam. |

Chhote sujhav (kabhi bhi, ek batch me): dukaan ko rating se sort karna, review par dukaan ka jawab, dish ki photo ka bada view, admin panel ki bhasha.

### Zaroori baatein

- `npm audit fix --force` mat chalana.
- `.env`, `.env.local`, database password, `JWT_SECRET`, access aur refresh token kisi ko mat bhejo, chat ya screenshot me bhi nahi.
- Hamesha `tiffin-ghar` folder se commit karo, `backend` ya `web` ke andar se nahi.
- Naya Prisma model ya migration ke baad `npx prisma generate` aur VS Code me `TypeScript: Restart TS Server`.
- Approval admin panel se (`/admin`). Admin banane ke liye Prisma Studio me `User.role` `ADMIN`.
- Provider ka role badalne ke baad naya token (refresh) zaroori hai (website me apne aap hota hai).
- Har naye kaam se pehle `git commit`.
- **Live se pehle:**
  - **Photos ko cloud storage par** le jao (S3/Cloudinary jaisa). Abhi `backend/uploads` disk par hai, hosting ki disk mita di jati hai. Database me sirf path hai, `photoSrc()` `http` wale link bhi seedha maanta hai.
  - Backend me asli customer ka IP (`trust proxy`, `X-Forwarded-For`), `cors()` me sirf apni website, asli SMS (DLT registration), hosting, domain, database backup, rate limit Redis me, purane expire hue refresh tokens saaf karne ka job.
  - FSSAI check, wallet aur payment ka expert review, security ki jaanch kisi jaankar se.
  - Website ka `API_URL` live me public link par (photo ke link ke liye bhi).
  - Hindi/English ke anuvad ek baar kisi jaankar se padhwa lo (khane, payment aur kanooni text).

### Test accounts

- `9999999999`: customer.
- `8888888888`: provider ("Sharma Ghar Ka Tiffin", Prayagraj, 211001, provider `id` 1, `APPROVED`).
- `7777777777`: naya provider (dashboard se profile banane ka test).
- `6666666666`: admin (`User.role` `ADMIN`).
- OTP abhi SMS se nahi, backend wale terminal me print hota hai.

### Files jinka code in notes me nahi hai

`web/src/app/session/refresh/route.ts` (token refresh wala route). Zaroorat par `tiffin-ghar` folder se:

```
Get-ChildItem -Recurse -Name web\src\app
```

```
Get-Content web\src\app\session\refresh\route.ts
```

(`LoginForm.tsx` ka code ab section 13 me hai.)

## 16. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, Next.js website, baad me React Native mobile app). Is app ka startup bhi karna hai, to ise professional banana hai. Chhe notes files attach ki hain (`tiffin-ghar-project-notes-step3.md`, `tiffin-ghar-project-notes-step3-5-1.md`, `tiffin-ghar-project-notes-step4.md`, `tiffin-ghar-project-notes-step5.md`, `tiffin-ghar-project-notes-step6.md` aur `tiffin-ghar-project-notes-step7.md`). Step 1 se 6.7 poore ho gaye (phone OTP login, JWT, refresh token, provider profile aur menu, order, orders, cancel, provider ka dashboard, admin panel, order ka live status), saath me Batch C (rating aur review), Design step (naya look, dukaan aur dish ki photo upload) aur Bhasha step (Hinglish, हिन्दी, English, user ki pasand database me) bhi ho gaye aur test pass hain. `tiffin-ghar-project-notes-step7.md` me section 13 me website ke pages ke final (bhasha wale) code hain, section 4 ke kuch purane versions unse badal gaye hain. Mene [git commit aur push kar diya hai / ye abhi baki hai]. Ab Mobile app (React Native, Expo) se shuru karna hai, wahi backend aur wahi bhasha ki message files use karke. Mujhe jo bhi kaam kai steps me ek saath ho sakta hai wo ek saath (batch me) do, taaki bar-bar wahi code na badalna pade, par tabhi jab usse kuch toote nahi. Hinglish me step by step samjhao, har file kis folder me banani hai ye saaf batao, ek-ek command alag line me do, aur jahan files banane ke baad kuch test karna ho, saari commands aur browser ke steps likh kar do. Notes files me hamesha saari commands (login aur har test command) rakhna.
