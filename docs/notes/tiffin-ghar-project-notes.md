# Tiffin Ghar: Project Notes (React + Node.js)

Ye file naye chat me aage badhne ke liye hai. Isme wo sab hai jo ab tak tay hua aur bana.

## 1. App kya hai

Pure India (chhote aur bade shehron, districts) ke liye ek tiffin service app, jo mobile app aur website dono par chale.

**Customer ke liye:**
- Apne nearby sabhi tiffin providers aur unka aaj ka meal dikhe
- Ek baar ka order, "Roz ka" plan ya "Mahine ka" plan (26 din, 5% bachat)
- Payment: online (UPI/card), cash on delivery, aur wallet
- Wallet me ek mahine ka paisa add ho, roz ka tiffin usi se katta jaye
- Subscription pause/skip/band, order tracking (Ban raha hai, Raste me, Pahunch gaya)

**Provider ke liye:** apni profile aur FSSAI, roz ka menu aur daam, dukaan khula/band, orders dekhna aur status badalna, kamai.

**Admin ke liye:** naye providers approve ya reject karna, complaints, stats.

Ek clickable HTML prototype pehle hi banakar dikhaya ja chuka hai (customer, provider, admin views).

## 2. Tech stack ka faisla

Pehle Flutter + Supabase socha tha. Ab final faisla: **React + Node.js**.

| Hissa | Technology |
|---|---|
| Website | Next.js (React) |
| Mobile app | React Native (Expo) |
| Backend | Node.js + Express (TypeScript baad me) |
| Database | PostgreSQL + Prisma |
| Login | Phone OTP (MSG91 jaisi SMS service) + JWT |
| Payment | Razorpay |

Mobile aur website dono ek hi backend API use karenge, isliye sabse pehle backend banta hai.

## 3. Kaam ka order

1. Setup: Node.js, backend skeleton (**ho gaya**)
2. Database (PostgreSQL + Prisma), users table, login (phone OTP) (**ab yahan**)
3. Provider profile aur menu
4. Website: nearby providers ki list
5. Ek baar ka order
6. Mobile app (React Native), wahi API use karke
7. Subscription, wallet aur payment
8. Tracking, rating aur admin panel

## 4. Ab tak kya ho chuka hai

- Node.js install hai (version `v26.11.1`), VS Code aur Android Studio pehle se hain.
- Folder: `tiffin-ghar/backend`. Isme `index.js`, `package.json`, `package-lock.json`, `.gitignore` aur `node_modules`.
- Packages: `express`, `cors`, `dotenv`, aur dev me `nodemon`.
- Server `npm run dev` se chalta hai (port 5000), aur `http://localhost:5000` par `{"message":"Tiffin Ghar API chal rahi hai"}` dikhta hai.
- Git commit ho gaya aur code GitHub par private repository `tiffin-ghar` me push ho gaya.
- Flutter ka demo project bana tha, par ab use nahi hoga.

### index.js (abhi ka code)

```js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Tiffin Ghar API chal rahi hai" }));

app.listen(5000, () => console.log("Server 5000 par chalu"));
```

### package.json ke scripts me

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "dev": "nodemon index.js"
}
```

### .gitignore (tiffin-ghar/backend me)

```
node_modules
.env
```

## 5. Abhi kahan ruke hain: Step 2

1. **PostgreSQL install** karna (postgresql.org/download/windows se EDB installer, pgAdmin 4 saath me). `postgres` password kahin likh ke rakhna. (Ye install abhi confirm nahi hua.)
2. pgAdmin me `tiffin_ghar` naam ka database banana.
3. Prisma lagana (naye version ke commands docs se check karke) aur Node ko database se jodna.
4. Pehli table `users` banana (customer, provider, admin role).
5. Login ki API (phone number se OTP).

## 6. Zaroori baatein

- `npm audit fix --force` abhi nahi chalana, wo packages tod sakta hai. App live karne se pehle `npm audit` dekhenge.
- Database ka password aur connection link sirf `.env` file me rakhna, GitHub par kabhi nahi daalna.
- Wallet me paisa rakhne ke RBI ke rules ke baare me kisi expert se pooch lena. Shuru me payment Razorpay se.
- Providers ko FSSAI registration chahiye hoti hai.
- Pura India ek saath nahi, pehle ek shehar me chalakar phir failana.

## 7. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (React + Node.js + PostgreSQL + Prisma, website aur mobile dono). Ye project notes file attach ki hai. Step 1 (Node backend, GitHub) ho gaya hai. Ab Step 2 se aage badhna hai: PostgreSQL, Prisma, users table aur login. Hinglish me step by step samjhao.
