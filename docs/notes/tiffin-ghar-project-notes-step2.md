# Tiffin Ghar: Project Notes (Step 1 aur Step 2 poore)

Ye file pehli notes file ke aage ki hai. Isme Step 2 tak ka sab kuch hai. **Step 3 (login, phone OTP) naye chat se shuru hoga.**

## 1. App kya hai (chhota yaad)

Pure India (chhote aur bade shehron, districts) ke liye tiffin service app, mobile aur website dono par.
- **Customer:** nearby providers aur unka aaj ka meal dekhe, ek baar ka / roz ka / mahine ka (26 din, 5% bachat) order kare, payment wallet, UPI/card ya COD se, subscription pause/band kare, order tracking dekhe.
- **Provider:** profile aur FSSAI, roz ka menu aur daam, dukaan khula/band, orders ka status badalna, kamai.
- **Admin:** naye providers approve/reject, complaints, stats.
- Ek clickable HTML prototype pehle bana kar dikhaya ja chuka hai.

## 2. Final tech stack

| Hissa | Technology |
|---|---|
| Website | Next.js (React) |
| Mobile app | React Native (Expo) |
| Backend | Node.js + Express, TypeScript (`tsx` se chalta hai) |
| Database | PostgreSQL 18 + Prisma **7.10.0** |
| Login | Phone OTP (SMS service baad me) + JWT |
| Payment | Razorpay |

## 3. Kaam ka order

1. Setup: Node.js, backend skeleton (**ho gaya**)
2. Database, Prisma, User table, users API (**ho gaya**)
3. Login: phone OTP + JWT (**agla, naye chat me**)
4. Provider profile aur menu
5. Website: nearby providers ki list
6. Ek baar ka order
7. Mobile app (React Native), wahi API use karke
8. Subscription, wallet aur payment
9. Tracking, rating, admin panel

## 4. Ab tak ka kaam (Step 1 aur Step 2)

- Node.js `v26.11.1`, VS Code, Android Studio installed.
- PostgreSQL 18 aur pgAdmin 4 installed. Database ka naam `tiffin_ghar`. (pgAdmin me do server entries dikhti hain, dono ek hi `localhost:5432` ko dikhati hain, isse koi dikkat nahi.)
- Folder: `tiffin-ghar/backend`. GitHub par private repo `tiffin-ghar`.
- Prisma ko **7.10.0** par pin kiya (pehle `8.0.0-rc.22` aa gaya tha, wo test version tha aur flags nahi maanta tha).
- Backend ko ES modules + TypeScript me badla, `index.js` hata kar `index.ts`.
- `User` table ban gayi, aur `/users` API se `Test User` save aur list hua. Prisma Studio me bhi table dikhi.

### Folder structure (backend)

```
backend/
  index.ts
  lib/prisma.ts
  prisma/schema.prisma
  prisma/migrations/..._init/
  prisma.config.ts
  tsconfig.json
  package.json
  .env            (GitHub par nahi jata)
  .gitignore
  generated/prisma  (Prisma banata hai, GitHub par nahi jata)
```

### package.json me zaroori cheezein

```json
"type": "module",
"scripts": {
  "dev": "tsx watch index.ts"
}
```
Chalane ke liye: `npm run dev` (server port 5000 par).

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

### prisma/schema.prisma

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
```

### .env me (sirf naam, password yahan nahi)

```
DATABASE_URL="postgresql://postgres:APKA_PASSWORD@localhost:5432/tiffin_ghar?schema=public"
```
Password me `@` ho to `%40`, `#` ho to `%23` likhna.

### lib/prisma.ts

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

### index.ts

```ts
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Tiffin Ghar API chal rahi hai" });
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "phone zaroori hai" });
    const user = await prisma.user.create({ data: { phone, name } });
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: "User nahi bana (shayad ye phone pehle se hai)" });
  }
});

app.listen(5000, () => console.log("Server 5000 par chalu"));
```

### Test karne ka command (PowerShell)

```
Invoke-RestMethod -Uri http://localhost:5000/users -Method Post -ContentType "application/json" -Body '{"phone":"9999999999","name":"Test User"}'
```
Phir browser me `http://localhost:5000/users`.

## 5. Jo dikkatein aayi aur unka hal

- **Prisma `8.0.0-rc.22` aaya:** `npm install prisma@7.10.0 --save-dev` aur `npm install @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0`.
- **`prisma init` ke flags nahi chale:** version 7.10.0 par `npx prisma init --output ../generated/prisma` chala.
- **Config file ka naam `prisma7.config.ts`:** `prisma.config.ts` me rename karna padta hai.
- **CommonJS vs import error:** `package.json` me `"type": "module"` aur `index.js` ko import wale code me badla.
- **`Property 'user' does not exist`:** schema badalne ke baad `npx prisma generate` chalana bhoolna. Niyam: schema badlo, phir `npx prisma migrate dev --name naam`, phir `npx prisma generate`.
- **`.gitignore` me extra space:** line ke aage space hone par Git use ignore nahi karta. Terminal se `Set-Content -Path .gitignore -Value "node_modules",".env",...` se saaf likhi.
- **PostgreSQL service nahi mili:** install adhura tha, dobara poora install kiya.

## 6. Zaroori baatein

- `npm audit fix --force` mat chalana. App live karne se pehle `npm audit` dekhenge.
- `npm warn install-scripts` wali chetavani abhi andekha karo. Agar engine/esbuild ka error aaye, to `npm install-scripts approve @prisma/engines prisma esbuild` chalao.
- `.env`, database password aur `JWT_SECRET` kisi ko mat bhejo, chat me bhi nahi, aur screenshot me bhi mat dikhao.
- Commit se pehle `git status --short` dekho, `.env` ya `node_modules` list me nahi dikhna chahiye. Step 2 ka commit aur push agar baki ho, to pehle wo karo:
  ```
  git add .
  git commit -m "Step 2: PostgreSQL, Prisma 7, User table, users API"
  git push
  ```
- Wallet ke RBI rules ke baare me kisi expert se poochna. Providers ko FSSAI chahiye. Pehle ek shehar me chalana, phir failana.

## 7. Step 3: Login (naye chat me)

Plan: user phone number deta hai, server OTP banata hai (abhi terminal me print hoga, asli SMS baad me), user OTP deta hai, sahi hone par server JWT token deta hai, aur `/me` route batata hai ki kaun logged in hai. OTP ka hash database me save hoga.

Step 3.1 ke taiyari steps (**abhi kiye nahi gaye**, naye chat me karne hain):
1. `schema.prisma` me `Otp` model jodna (`phone`, `codeHash`, `expiresAt`, `attempts`, `createdAt`).
2. `npx prisma migrate dev --name add_otp`, phir `npx prisma generate`.
3. `npm install jsonwebtoken` aur `npm install --save-dev @types/jsonwebtoken`.
4. `JWT_SECRET` banana (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) aur `.env` me daalna.
5. Phir routes: `/auth/send-otp`, `/auth/verify-otp`, `/me`.

## 8. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, baad me Next.js website aur React Native mobile app). Ye project notes file attach ki hai. Step 1 aur Step 2 poore ho gaye hain (database, User table, /users API chal rahi hai). Ab Step 3 se aage badhna hai: phone OTP login aur JWT. Hinglish me step by step samjhao.
