# Tiffin Ghar: Notes (Mobile Step 1-2, Phase 1 backend, Phase 2 provider dashboard: saari commands)

Ye file `tiffin-ghar-project-notes-step7.md` (aur usse pehle ki files) ke **baad** ki hai. Is file me wo sab hai jo Bhasha step ke baad hua: mobile app ka setup (Step 1, 2), Justdial dekh kar tay hue naye features, Phase 1 (database + backend) aur Phase 2 (provider dashboard website par).

**Code ke baare me:** pehle ki notes me poora code copy hota tha. Ab saara code git aur GitHub (`raviverma70/tiffin-ghar`) par hai, isliye yahan sirf **kaun si file kahan hai, kya karti hai, faisle, saari commands aur galtiyan** hain. Kisi commit ka poora code dekhna ho to section 9 ki `git show` command chalao.

## 1. Abhi kahan hain

| Kaam | Haalat | Commit |
|---|---|---|
| Mobile Step 1: Expo setup (SDK 57), Expo Router, bhasha web se | ho gaya, phone par test pass | `979e56a`, `752ba53` |
| Mobile Step 2: `api()` (token + refresh), secure tokens, `useT()`, bhasha chunna | ho gaya, phone par test pass | `9fa9fa7` |
| Phase 1: migration + backend (location, sorting, plans, subscriptions, favourite, review photo) | ho gaya, 30+ API test pass | `013b492` |
| Phase 2: provider dashboard (location button, mealTime, plans + din-wise menu grid, subscriptions page, suggestion chips) | ho gaya, browser test pass | `0a8a688` |
| Push | dono phase GitHub par | `main` = `0a8a688` |

**Agla:** Phase 3 (front page), phir 4, 5, 6 (section 11). Mobile Step 3 (OTP login) Phase 3 se pehle ya baad, dono chal sakta hai.

## 2. Faisle jo tay hue

### Mobile app
- Folder `mobile/`. **Expo SDK 57** (React Native 0.86.3, React 19.2.3), kyunki Play Store ka Expo Go abhi SDK 57 hi chalata hai. Expo Go me SDK 58 aa jaye to upgrade: `npx expo install expo@^58.0.0` phir `npx expo install --fix`.
- Bhasha ki files **copy nahi hoti**: `mobile/metro.config.js` me `watchFolders` se mobile seedha `web/src/i18n/` padhta hai. Text sirf web ki files me badlo.
- Backend se baat sirf `mobile/src/lib/api.ts` ke `api()` se. `auth: true` par token lagta hai, 401 par refresh karke ek baar dobara try.
- **Ek waqt par ek hi refresh** (backend har refresh par purana refresh token band karta hai, do saath chale to session khatam).
- Tokens `expo-secure-store` me (`tg_access`, `tg_refresh`), bhasha `tg_lang` me.
- Phone par `localhost` nahi chalta. `mobile/.env` me PC ka Wi-Fi IP: `EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api/v1` (`.env` GitHub par nahi jaati). `.env.example` Claude ki deny setting ki wajah se nahi bani, steps `mobile/README.md` me hain.
- Expo template ka `LICENSE` hata diya (Expo ka copyright tha). `AGENTS.md` aur `.claude/settings.json` rakhe.

### Justdial se kya liya, kya nahi
- **Liya (apne andaaz me):** rating aur doori se sort, area, khulne ka time, card par aaj ki dishes aur "₹60 se shuru", verified badge (FSSAI), review ki ek line, favourite, share, tabs, subscription plans.
- **Nahi liya:** "Show Number" aur WhatsApp button (customer bahar order kar lega, record aur kamai nahi), lead form, bade banner ads, WiFi/Alcohol jaise filter, AI assistant.
- Look apna rahega: orange, saaf card, har card par ek main button.

### Location aur sorting
- Customer ki location **save nahi hoti**, sirf sort ke liye aati hai, ~100 meter tak gol (`roundCoord`). Dukaan ka exact location bahar nahi jata, sirf `distanceKm`.
- Location ho to default sort "paas wali pehle", warna "top rating". `area` diya ho to us area ki dukaanein sabse pehle, phir baaki shehar.
- **Rating sort ka sahi hisaab** (`backend/lib/geo.ts` → `ratingScore`): kam reviews wali dukaan ko 3.5 ki taraf kheencha jata hai (prior 3.5, weight 5), taaki 1 review wali 5.0 dukaan 190 review wali 4.6 se upar na aaye.
- Rating abhi **dukaan** ki hai, dish ki nahi. Dish ki rating baad me.
- Ek shehar me 500 dukaan tak sort memory me hota hai. Zyada ho to PostGIS.
- Browser location sirf `localhost` ya `https` par. Phone ke browser me IP wale link par nahi milegi (mobile app me `expo-location` se milegi).

### Subscription plans
- Dukaan wala khud chunta hai: **kitne din** (1 se 31), **kaun se time** (BREAKFAST / LUNCH / DINNER, ek ya zyada), **daam** (paise me), veg, naam, jaankari.
- Har din ke har time ki dishes `PlanDayMenu` me (`day`, `mealTime`, `dishes[]`). Weekly repeat ke liye grid me "Pehle 7 din har hafte repeat" button (Din 8 = Din 1).
- **Naya plan band rehta hai.** Poora menu bharne ke baad hi chalu hota hai. Chalu plan ka menu adhoora save nahi hota.
- Customer ke subscription me naam, din, time aur daam **copy** hote hain (plan baad me badle to bhi record na badle).
- Plan hatane par, agar kisi ne liya ho, to plan sirf **band** hota hai.
- **Paisa abhi seedha dukaan wale ko (COD jaisa).** Razorpay aur wallet baad me (wallet ke RBI rules expert se poochne hain).
- Status: `REQUESTED` → `ACTIVE` ya `REJECTED`; `ACTIVE` → `COMPLETED` ya `CANCELLED`. Customer sirf `REQUESTED` par cancel kar sakta hai.
- Shuru ki tareekh: aaj se 30 din ke andar (India ki tareekh).

### Kaam karne ka tareeka
- Bada kaam **phase-wise**: har phase ke baad `tsc`, test, commit (aapse pooch kar), phir agla.
- Har naye feature ka kram: backend API → bhasha ke text (teeno files) → website → mobile.
- Har phase ke baad is notes file me naya section judega.

## 3. Database (migration `20261024014007_subscriptions_location_review_photos`)

| Model / field | Kya hai |
|---|---|
| `Provider.latitude`, `longitude`, `area` | Dukaan ki jagah aur mohalla |
| `MenuItem.mealTime` (`MealTime` enum, default `LUNCH`) | Nashta / dopahar / raat |
| `ReviewPhoto` | Review ke saath photo (3 tak) |
| `SubscriptionPlan` | `days`, `mealTimes[]`, `pricePaise`, `isVeg`, `isActive` |
| `PlanDayMenu` | `planId`, `day`, `mealTime`, `dishes[]`, unique `(planId, day, mealTime)` |
| `Subscription` | customer, plan, copy fields, `startDate` (sirf tareekh), `status`, `paymentMethod` COD |
| `Favourite` | `(userId, providerId)` |
| Enums | `MealTime`, `SubscriptionStatus` |

## 4. Files (kahan kya hai)

`*` = naya, `~` = badla.

```
tiffin-ghar/
  mobile/                              * Expo app (SDK 57)
    app.json, metro.config.js, tsconfig.json, README.md, .gitignore
    src/app/_layout.tsx, index.tsx     (test screen: dukaan list + bhasha)
    src/lib/api.ts, tokens.ts, config.ts, format.ts, photo.ts
    src/i18n/shared.ts (web se), provider.tsx (useT), index.ts
    src/components/LanguagePicker.tsx
  backend/
    prisma/schema.prisma               ~ upar ke models
    lib/geo.ts                         * distanceKm, roundCoord, ratingScore, averageRating
    lib/images.ts                      * photo save/padhna (photos.ts se nikala)
    lib/plans.ts                       * isMenuComplete
    lib/time.ts                        ~ todayDateInIndia, addDays
    validators/common.ts               * mealTime, latitude, longitude, area, pageQuery
    validators/plan.ts, subscription.ts  *
    validators/provider.ts, publicProvider.ts, menu.ts  ~
    routes/publicProviders.ts          ~ nayi sorting, /cities, /areas, /:id/plans
    routes/plans.ts                    * /plans, /plans/:id (public)
    routes/providerPlans.ts            * /providers/me/plans
    routes/subscriptions.ts            * /subscriptions (customer)
    routes/providerSubscriptions.ts    * /providers/me/subscriptions
    routes/me.ts                       ~ /me/favourites
    routes/reviews.ts                  ~ /reviews/:id/photos, photos list me
    routes/orders.ts                   ~ review ke saath id aur photos
    routes/photos.ts                   ~ lib/images.ts use karta hai
    app.ts                             ~ naye routers
  web/src/
    components/suggest-input.tsx       * click par suggestion chips
    components/location-picker.tsx     * "Meri abhi ki location lo"
    components/dash-nav.tsx            ~ Plans, Subscriptions tabs
    lib/suggestions.ts                 * dishes, shehar, daam, plan ke naam
    lib/provider.ts                    ~ MealTime, plan/subscription types, status ke rang
    lib/format.ts                      ~ formatDay, lastDayIso
    lib/api.ts                         ~ getAreas
    app/dashboard/page.tsx, profile-form.tsx, actions.ts  ~
    app/dashboard/menu/page.tsx, item-form.tsx            ~ mealTime
    app/dashboard/plans/page.tsx, plan-form.tsx, actions.ts            *
    app/dashboard/plans/[id]/page.tsx, menu-grid.tsx                   *
    app/dashboard/subscriptions/page.tsx                                *
    i18n/messages/*.ts, errors.ts      ~ 45 error + 91 naye text, subscription status
```

## 5. Naye API routes

Base: `http://localhost:5000/api/v1`

| Method | Path | Kaun | Kya |
|---|---|---|---|
| GET | `/providers?city=&area=&lat=&lng=&sort=distance\|rating&veg=1` | sab | dukaanein, doori, aaj ki 3 dish, plans ki ginti |
| GET | `/providers/cities` | sab | shehar jahan dukaanein hain |
| GET | `/providers/areas?city=` | sab | shehar ke area |
| GET | `/providers/:id/plans` | sab | dukaan ke chalu plans, din-wise menu |
| GET | `/plans?city=&area=` | sab | front page ki plans row |
| GET | `/plans/:id` | sab | ek plan poore menu ke saath |
| PATCH | `/providers/me` | provider | ab `area`, `latitude`, `longitude` bhi |
| GET/POST | `/providers/me/plans` | provider | mere plans / naya plan |
| GET/PATCH/DELETE | `/providers/me/plans/:id` | provider | ek plan / badlo (`isActive` bhi) / hatao |
| PUT | `/providers/me/plans/:id/menu` | provider | poora din-wise menu ek saath |
| GET | `/providers/me/subscriptions?status=` | provider | dukaan ke subscriptions |
| PATCH | `/providers/me/subscriptions/:id/status` | provider | `ACTIVE`, `REJECTED`, `COMPLETED`, `CANCELLED` |
| GET/POST | `/subscriptions` | customer | mere subscriptions / plan lo |
| GET | `/subscriptions/:id` | customer | ek subscription din-wise menu ke saath |
| PATCH | `/subscriptions/:id/cancel` | customer | sirf `REQUESTED` par |
| GET | `/me/favourites` | login | pasandida dukaanein |
| PUT/DELETE | `/me/favourites/:providerId` | login | jodo / hatao |
| POST | `/reviews/:id/photos` | review wala | photo (raw image body, 2 MB, 3 tak) |
| DELETE | `/reviews/:id/photos/:photoId` | review wala | photo hatao |

## 6. Chalana (har baar)

Backend (pehla terminal):
```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\backend"
```
```
npm run dev
```

Website (doosra terminal):
```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\web"
```
```
npm run dev
```

Mobile (teesra terminal, phone par Expo Go, same Wi-Fi):
```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\mobile"
```
```
npx expo start --clear
```
Terminal me `w` mat dabana (web version hamare kaam ka nahi). QR code phone ke Expo Go se scan karo.

Database dekhna (`backend` folder me):
```
npx prisma studio
```

## 7. Login commands (PowerShell, `backend` folder wale terminal me)

Server wala terminal nahi, doosra terminal. OTP **server wale terminal** me `OTP for ...: ......` dikhega. Token chat me mat dikhao.

Provider (`8888888888`): `$access`
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"8888888888"}'
```
```
$r = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"8888888888","code":"ASLI_OTP"}'
```
```
$access = $r.accessToken
```
```
$P = @{ Authorization = "Bearer $access" }
```

Customer (`9999999999`): `$access2` (pehla OTP maanga ho to 60 second ruko)
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/send-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999"}'
```
```
$r2 = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/verify-otp -Method Post -ContentType "application/json" -Body '{"phone":"9999999999","code":"ASLI_OTP"}'
```
```
$access2 = $r2.accessToken
```
```
$C = @{ Authorization = "Bearer $access2" }
```

Token expire (15 minute) ho jaye to login dobara karo. Galat request par PowerShell laal error dikhata hai, uske andar backend ka Hinglish message hota hai: jahan "error aayega" likha hai wahan wahi sahi hai.

## 8. Tests

### 8.1 Phase 1: backend (PowerShell)

Dukaan list, location ke saath (doori `distanceKm`, sort `distance`):
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers?city=Prayagraj&lat=25.44&lng=81.85" | ConvertTo-Json -Depth 6
```
Top rating sort aur area pehle:
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers?city=Prayagraj&sort=rating&area=Civil%20Lines" | ConvertTo-Json -Depth 6
```
Bina location "paas wali" (error aayega: "Paas ki dukaan ke liye location chahiye"):
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers?city=Prayagraj&sort=distance"
```
Shehar aur area:
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers/cities" | ConvertTo-Json -Depth 4
```
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers/areas?city=Prayagraj" | ConvertTo-Json -Depth 4
```

Dukaan ki location (provider). Sirf latitude bhejo to error aayega:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me -Method Patch -Headers $P -ContentType "application/json" -Body '{"area":"Civil Lines","latitude":25.4537,"longitude":81.8343}'
```

Naya plan (band banta hai):
```
$plan = Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/plans -Method Post -Headers $P -ContentType "application/json" -Body '{"name":"Test 3 din","days":3,"mealTimes":["LUNCH","DINNER"],"pricePaise":30000}'
```
```
$plan.id, $plan.isActive
```
Menu ke bina chalu (error aayega: "Plan chalu karne se pehle har din ka menu bharo"):
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/plans/$($plan.id)" -Method Patch -Headers $P -ContentType "application/json" -Body '{"isActive":true}'
```
Poora menu (3 din × 2 time = 6):
```
$items = 1..3 | ForEach-Object { @{ day = $_; mealTime = "LUNCH"; dishes = @("Dal", "Chawal", "4 Roti") }; @{ day = $_; mealTime = "DINNER"; dishes = @("Dal", "4 Roti", "Sabzi") } }
```
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/plans/$($plan.id)/menu" -Method Put -Headers $P -ContentType "application/json" -Body (@{ items = $items } | ConvertTo-Json -Depth 5) | Select-Object -ExpandProperty dayMenus | Measure-Object
```
Ab chalu (`True`):
```
(Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/plans/$($plan.id)" -Method Patch -Headers $P -ContentType "application/json" -Body '{"isActive":true}').isActive
```
Galat din (Din 4, error aayega: "Din plan ke dino se zyada hai"):
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/plans/$($plan.id)/menu" -Method Put -Headers $P -ContentType "application/json" -Body '{"items":[{"day":4,"mealTime":"LUNCH","dishes":["Dal"]}]}'
```
Public plans:
```
Invoke-RestMethod "http://localhost:5000/api/v1/plans?city=Prayagraj" | ConvertTo-Json -Depth 6
```
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers/1/plans" | ConvertTo-Json -Depth 6
```

Subscription (customer). Purani tareekh par error aayega:
```
$today = Get-Date -Format "yyyy-MM-dd"
```
```
$sub = Invoke-RestMethod -Uri http://localhost:5000/api/v1/subscriptions -Method Post -Headers $C -ContentType "application/json" -Body (@{ planId = $plan.id; startDate = $today; deliveryAddress = "12 Civil Lines, Prayagraj" } | ConvertTo-Json)
```
```
$sub.id, $sub.status, $sub.pricePaise
```
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/subscriptions -Headers $C | ConvertTo-Json -Depth 5
```
Provider apni dukaan ka plan le (error aayega: "Aap apni hi dukaan ka plan nahi le sakte"):
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/subscriptions -Method Post -Headers $P -ContentType "application/json" -Body (@{ planId = $plan.id; startDate = $today; deliveryAddress = "12 Civil Lines, Prayagraj" } | ConvertTo-Json)
```
Provider ko dikhe aur chalu kare:
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/subscriptions?status=REQUESTED" -Headers $P | ConvertTo-Json -Depth 5
```
```
(Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/subscriptions/$($sub.id)/status" -Method Patch -Headers $P -ContentType "application/json" -Body '{"status":"ACTIVE"}').status
```
Chalu ke baad customer cancel (error aayega):
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/subscriptions/$($sub.id)/cancel" -Method Patch -Headers $C
```
Plan hatao (subscription hai to `deleted: False`, sirf band):
```
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/providers/me/plans/$($plan.id)" -Method Delete -Headers $P
```

Favourite:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/me/favourites/1 -Method Put -Headers $C
```
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/me/favourites -Headers $C | ConvertTo-Json -Depth 4
```
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/me/favourites/1 -Method Delete -Headers $C
```

Menu item nashte ka:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/providers/me/menu -Method Post -Headers $P -ContentType "application/json" -Body '{"name":"Poha","pricePaise":3000,"mealTime":"BREAKFAST"}'
```

Review photo (customer, apne review par; review id `GET /orders` me `review.id`). `PHOTO_PATH` ki jagah koi chhoti JPG:
```
Invoke-RestMethod -Uri http://localhost:5000/api/v1/reviews/REVIEW_ID/photos -Method Post -Headers $C -ContentType "image/jpeg" -InFile "PHOTO_PATH"
```
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers/1/reviews" | ConvertTo-Json -Depth 5
```

### 8.2 Phase 2: website (browser)

1. `http://localhost:3000/login?as=provider` → `8888888888` → OTP server terminal se.
2. **Dashboard:** naye card "Naye subscription requests" aur "Subscription plans". Location na bhari ho to peela message.
3. **Profile badlo:** Area ke box par click → chips. **Meri abhi ki location lo** → browser "Allow" → "Map par dekho" → **Save**.
4. **Menu:** Nashta / Lunch / Dinner chuno → Dish ke box par click → chip chuno → daam ke chips → Item jodo. List time ke hisaab se alag dikhegi.
5. **Plans:** naya plan → naam ka chip → 15 din → Nashta + Lunch → daam 1500 ("Lagbhag ₹50 ek khana") → **Plan banao aur menu bharo**.
6. Plan ke page par: Din 1 ke Nashta me "+ Poha", likh kar Enter, Lunch me `Dal, Chawal, 4 Roti` + Enter (teen dish) → **Ye din sab dino me copy** → "Poora menu bhara hai" → **Menu save karo** → **Plan chalu karo**.
7. Din badal kar save na karo to "● Badlav save nahi hue" dikhna chahiye.
8. **Subscriptions:** filter chips, card par tareekh, customer, pata, rangin status. Request par "Chalu karo / Mana karo", chalu par "Poora hua / Cancel".
9. Bhasha badal kar (header me) har page हिन्दी aur English me dekho.

### 8.3 Mobile (phone)

1. `mobile/.env` me `EXPO_PUBLIC_API_URL=http://<PC-ka-IP>:5000/api/v1` (`ipconfig` se IPv4).
2. `npx expo start --clear`, QR scan.
3. "Prayagraj ki dukaanein" aur Sharma Ghar Ka Tiffin dikhe. Bhasha ke button se Hindi/English. App band karke kholo, bhasha yaad rahe.
4. Backend band karke `r` (reload) → chuni bhasha me "server se jud nahi paye".

### 8.4 Har kaam ke baad (teeno me kuch print na ho)

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
```
npx eslint src
```
```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\mobile"
```
```
npx tsc --noEmit
```
```
npx expo-doctor
```

## 9. Git

Hamesha `tiffin-ghar` folder se:
```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar"
```
```
git status
```
```
git log --oneline -5
```
Kisi commit ka poora code dekhna (jaise Phase 2):
```
git show 0a8a688 --stat
```
```
git show 0a8a688 -- web/src/app/dashboard/plans/actions.ts
```
Commit aur push (Claude pooch kar karta hai):
```
git add backend web mobile docs
```
```
git commit -m "message"
```
```
git push
```
GitHub: https://github.com/raviverma70/tiffin-ghar (account `raviverma70`). Repo private rakhna behtar hai (Settings → General → Danger Zone → Change visibility).

## 10. Galtiyan aur unke hal

| Galti | Hal |
|---|---|
| Phone par "Project is incompatible with this version of Expo Go" | Project SDK 58 aur Expo Go SDK 57 tha. Project SDK 57 par laaye. |
| SDK badalte waqt `expo install` me `react` ka ERESOLVE | `package.json` me template wale version likhe, `node_modules` aur `package-lock.json` hatakar `npm install`, phir `npx expo install <packages>` |
| `npm ls` me `react-native-worklets` "invalid", `expo-font@58` | `npx expo install react-native-worklets react-native-reanimated expo-font react-native-gesture-handler` |
| "Web Bundling failed ... react-native-web" | Terminal me `w` dab gaya tha. Web version ki zaroorat nahi, ignore karo. |
| `npx expo-doctor`: "npx expo config ... exited with non-zero code" | Command `tiffin-ghar` se chali thi. `mobile` folder me chalao. |
| `npm install` me network error | Dobara chalao. |
| `npm audit` me high vulnerabilities | Expo ke andar ke packages. `npm audit fix --force` **mat** chalao. |
| `exactOptionalPropertyTypes` se Prisma me `...body` nahi gaya | Har field alag se likha (`providerPlans.ts`). |
| `err.dayBad` key pehle se thi | Nayi duplicate key hatai, purani use ki. |
| Windows par `python3` se command atki | Microsoft Store wala launcher. Scripts ke liye `node` use karo. |
| Test ke liye OTP dusre terminal me | Usi database wala doosra backend `PORT=5001` par chala kar naya OTP banwaya. |
| Dashboard ke 6 tabs do line me | `dash-nav.tsx` me ek line, scroll. |

## 11. Agla aur bachi hui cheezein

1. **Phase 3, front page:** location ki permission (mana kare to shehar/area), "Paas me / Top rating / Pure veg" chips, card par doori, aaj ki dishes, "₹60 se shuru", verified badge, review ki line, neeche "Subscription plans" ki row. Shehar ke button `/providers/cities` se.
2. **Phase 4, dukaan ka page + subscription lena:** tabs (Aaj ka menu, Plans, Reviews, Jaankari), plan ka din-wise menu, plan lena (tareekh, pata), "Mere subscriptions", favourite (dil), share.
3. **Phase 5, review me photo** (website par upload, review ke saath dikhana).
4. **Phase 6, naya design har page par:** Mere orders ke rangin status badge, font, spacing, khali list ke achhe message.
5. **Mobile Step 3 se 9:** OTP login, dukaan list (location `expo-location` se), dukaan + cart, order, mere orders, review, provider dashboard.
6. Baad me: dish ki rating, milti-julti dukaanein, map par dukaan, Razorpay, wallet (RBI expert), notifications.
7. Test data: `Student Plan` (id 2) aur `7 din Lunch + Dinner` (id 1), customer ka subscription #1. Na chahiye to dashboard se hatao.

## 12. Naye chat me ye paste karo

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, Next.js 16 website, React Native Expo mobile app). Project ki `CLAUDE.md` padho. Notes files `docs/notes/` me hain, sabse nayi `tiffin-ghar-project-notes-step8.md`. Mobile Step 1-2, Phase 1 (backend: location sorting, subscription plans din-wise menu ke saath, favourite, review photo) aur Phase 2 (provider dashboard: location, nashta/lunch/dinner, plans ka grid, subscriptions, suggestion chips) ho gaye, commit aur push hue. Ab Phase 3 (front page) karna hai. Hinglish me step by step samjhao, har badlav ke baad kya badla, kyon aur kaun si file batao, saari test commands (PowerShell, ek line me ek) aur browser ke steps do, aur notes file me naya section jodo.
