# Tiffin Ghar: project guide for Claude Code

Pure India ke liye tiffin service app: customers apne shehar ki tiffin dukaanein dekhte hain, aaj ka menu chunte hain aur order karte hain (abhi sirf COD). Dukaan wale (providers) website par menu, orders aur photo sambhalte hain. Admin dukaanein approve karta hai. Ye ek startup banega, isliye code professional rakho.

## User (mere baare me)

- Mai CSE ka 2nd year student hu aur is app ka founder. Mujhe baat Hinglish me, step by step samjhao.
- Har badlav ke baad batao ki **kya badla, kyon, aur kaun si file kis folder me**. Mujhe code samajhte rehna hai.
- Jo kaam kai steps me ek saath ho sakta hai wo ek batch me karo, par tabhi jab usse kuch toote nahi ya dobara wahi code na badalna pade.
- Har kaam ke baad **saari test commands (PowerShell) aur browser ke steps** likh kar do. Ek command ek line me.
- Mai Windows par hu (PowerShell, VS Code). Path me space hai: `C:\Users\Ravi Kumar patel\tiffin-ghar`, to commands me path double quotes me likho.

## Stack

| Hissa | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript (ES modules, `tsx`), `backend/` |
| Database | PostgreSQL 18 + Prisma **7.10.0** (version badalna nahi) |
| Website | Next.js 16 (App Router, React 19), Tailwind v4, `web/` |
| Mobile app | React Native (Expo), **abhi shuru nahi hua** |
| Login | Phone OTP + JWT (access 14 min, refresh 30 din) |
| Payment | Abhi sirf COD. Baad me Razorpay |

## Chalana

- Backend: `cd backend`, `npm run dev` (port 5000). API: `http://localhost:5000/api/v1`.
- Website: `cd web`, `npm run dev` (port 3000).
- **Har kaam ke baad dono jagah `npx tsc --noEmit` chalao.** Kuch print na ho tab kaam poora.
- Git hamesha `tiffin-ghar` folder se. **Har naye kaam se pehle `git commit`. Commit aur push mujhse pooch kar.**
- OTP SMS se nahi aata, **backend ke terminal me print hota hai**.

## Folder structure (chhota)

```
backend/   app.ts, routes/, validators/ (zod), middleware/, lib/, prisma/schema.prisma, uploads/ (GitHub par nahi)
web/src/   app/ (pages), components/, lib/, i18n/ (bhasha)
docs/notes/  purani notes files (step3 se step7). Zaroorat par padho.
```

Roles: `CUSTOMER`, `PROVIDER`, `ADMIN`. Koi bhi naya number pehle `CUSTOMER`. Dukaan ki profile banate hi `PROVIDER`. `ADMIN` Prisma Studio se `User.role` badalkar.

## Zaroori niyam (inhe todna nahi)

**Security**
- `.env`, `.env.local`, database password, `JWT_SECRET`, access/refresh token **kabhi kholna, print karna ya commit karna nahi.** Chaahiye to mujhse poochho.
- `npm audit fix --force` mat chalana.
- Paisa **hamesha integer paise me** (`pricePaise`, `totalPaise`). Float nahi. Website par `₹` dikhane ke liye `formatPrice`.
- Backend me hamesha role check (`requireRole`) aur ownership check (sirf apna order/apni dukaan).

**Prisma**
- Schema badlo, phir `npx prisma migrate dev --name naam`, phir `npx prisma generate`, phir VS Code me `TypeScript: Restart TS Server`.

**Next.js 16 / React 19**
- `params` aur `searchParams` ek `Promise` hain: `const { id } = await params`.
- `redirect()` kabhi `try/catch` ke andar nahi.
- Forms ke fields `useState` se controlled rakho (React 19 form action ke baad uncontrolled fields khali kar deta hai).
- Backend ko bulane ke liye `authedFetch` (customer) aur `providerFetch` (provider/admin) use karo, seedha `fetch` nahi. Cookies `tg_access`, `tg_refresh` httpOnly hain.

**Bhasha (i18n): Hinglish (default), हिन्दी, English**
- Website ka koi bhi user-facing text code me seedha mat likho. `t("key")` use karo (server: `const { t } = await getT()`, client: `useT()`).
- Naya text: pehle `web/src/i18n/messages/hinglish.ts`, phir `hi.ts` aur `en.ts` (teeno me same keys, `tsc` pakadta hai).
- Backend error Hinglish me hi bhejta hai. Naya error message ho to `web/src/i18n/errors.ts` ke `ERROR_KEYS` me bhi jodo. Server actions me `apiError(res)` use karo.
- Admin panel (`/admin`) sirf Hinglish. Dukaan/dish ke naam translate nahi hote.

**Photos**
- Abhi `backend/uploads/` me (GitHub par nahi). Database me sirf path (`/uploads/<naam>`), website `photoSrc()` se link banati hai. Live se pehle cloud storage.

## Test accounts

- `9999999999` customer, `8888888888` provider ("Sharma Ghar Ka Tiffin", Prayagraj, 211001, `APPROVED`), `7777777777` naya provider (profile banane ke liye), `6666666666` admin.

## Ab tak kya bana hai

Phone OTP login + JWT + refresh token, provider profile/menu/dukaan khula-band, public dukaan list aur aaj ka menu, order dena/cancel/mere orders, provider ke orders aur status (`PLACED` se `DELIVERED`), customer ka order live status, rating aur review, admin panel (approve/reject, stats), dukaan aur dish ki photo upload, naya design (header/footer), Hinglish/हिन्दी/English.

## Agla kaam (plan)

1. **Mobile app** (React Native, Expo): wahi backend, wahi `i18n/messages` ki text files. Login (OTP), dukaan dekhna, order, mere orders, review, provider ka dashboard.
2. Subscription (mahine ka plan, 26 din, 5% bachat), wallet, payment (Razorpay). Wallet ke RBI rules ke liye mujhe kisi expert se poochna hai.
3. Live tracking, notifications, complaints.

## Live karne se pehle (abhi nahi)

Photos cloud par, asli SMS (DLT), `cors()` sirf apni website, `trust proxy`, rate limit Redis me, database backup, FSSAI check, security review, Hindi/English ke anuvad kisi jaankar se.

## Kaam karne ka tareeka

- Pehle batao ki kya karne wale ho (chhota plan), phir karo.
- Kuch tootne wala ho (migration, files hatana, schema) to pehle poochho.
- Kaam ke baad notes file me jodne layak baatein bata do: naye files, naye commands, galtiyan aur unke hal. Notes me **saari commands** (login aur har test command) honi chahiye, sirf code nahi.
