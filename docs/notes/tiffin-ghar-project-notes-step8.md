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
| Push | Phase 1, 2 GitHub par | `main` = `0a8a688` |
| Phase 3: front page (location, sort, area, naya card, plans ki row) | ho gaya, push hua | `4679e6b` |
| Phase 4: dukaan ke tabs, plan lena, mere subscriptions, favourite, share | ho gaya, push hua | `ec03c2d` |
| Phase 5: review me photo + baar-baar logout ka bug fix | ho gaya, push hua | `5eb37e1` |
| Phase 6: naya design (status ke rang, timeline, header, footer, login, font) | ho gaya, push hua | `6fb124a` |
| Mobile Step 3: OTP login, login yaad rakhna, logout, bhasha sync | ho gaya, phone par test pass, push hua | Mobile Step 3 commit |

**Agla:** Mobile Step 4 (dukaan list, location `expo-location` se). Mobile Step 3 section 16 me. Phase 3 section 12, Phase 4 section 13, Phase 5 section 14, Phase 6 section 15 me. Mobile Step 3 (OTP login) Phase 3 se pehle ya baad, dono chal sakta hai.

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

1. ~~Phase 3, front page~~: ho gaya (section 12).
2. ~~Phase 4, dukaan ka page + subscription lena~~: ho gaya (section 13).
3. ~~Phase 5, review me photo~~: ho gaya (section 14).
4. ~~Phase 6, naya design~~: ho gaya (section 15).
5. **Mobile Step 3 se 9:** OTP login, dukaan list (location `expo-location` se), dukaan + cart, order, mere orders, review, provider dashboard.
6. Baad me: dish ki rating, milti-julti dukaanein, map par dukaan, Razorpay, wallet (RBI expert), notifications.
7. Test data: `Student Plan` (id 2) aur `7 din Lunch + Dinner` (id 1), customer ka subscription #1. Na chahiye to dashboard se hatao.

## 12. Phase 3: front page (location, sort, naya card, plans ki row)

### Kya bana
- Page khulte hi **location ki permission** maangta hai (ek tab me ek hi baar apne aap). Mil gayi to bina shehar likhe **"Aapke paas ki dukaanein"**, sabse paas wali pehle, card par "📍 2.2 km door". Mana kiya to "Location nahi mili, neeche shehar chuno" aur "Dobara try karo" button.
- Location **URL me nahi jati**, `tg_loc` cookie me (httpOnly, 1 din, ~100 meter tak gol). "Location hatao" se cookie hat jati hai. Database me kabhi save nahi hoti.
- Chips: **📍 Paas me** (sirf location ho to), **⭐ Top rating**, **🟢 Pure veg**. Shehar chuno to **Area** ke chips (Poora shehar, Civil Lines...). Chuna area sabse upar, card par "Aapke area me".
- Shehar ke button ab backend se (`/providers/cities`), haath se likhe nahi. Backend band ho to purani list.
- **Naya dukaan card:** photo par doori aur area badge, hara rating badge (4+ hara, 3+ halka hara, kam ho to peela, review na ho to "Nayi"), Verified (FSSAI), Pure veg, "2 plan", aaj ki dishes time ke icon ke saath, review ki ek line, "₹60 se shuru", ek hi button "Menu dekho".
- Dukaanon ke neeche **🗓️ Subscription plans** ki row (side me scroll): din, time, Din 1 ka menu, poora daam, "₹120 roz", dukaan ki rating. Achhi rating wali dukaanon ke plans pehle. "Plan dekho" seedha plan ke page `/plans/[id]` par jata hai (Phase 4 me badla).

### Backend badlav
- `GET /providers` me ab `city` zaroori nahi agar `lat`/`lng` ho. Tab location ke ~50 km dabbe (0.45 degree) ki dukaanein aati hain. Na shehar na location ho to error "Shehar likho".

### Files
```
backend/validators/publicProvider.ts   ~ city optional (location ho to)
backend/routes/publicProviders.ts      ~ NEAR_DEG dabba
web/src/app/page.tsx                   ~ poora naya front page
web/src/app/location-actions.ts        * saveLocationAction, clearLocationAction (cookie)
web/src/lib/location.ts                * cookie padhna, India ki seema, gol karna
web/src/lib/api.ts                     ~ getProviders(options), ShopCard, getPlans, getCities
web/src/components/location-prompt.tsx * permission maangna, "Location hatao"
web/src/components/shop-card.tsx       * naya card + RatingBadge
web/src/components/plan-card.tsx       * plan ka card
web/src/i18n/messages/*.ts             ~ 33 naye home.* text
```

### Tests

Backend (PowerShell, koi bhi folder):
```
(Invoke-RestMethod "http://localhost:5000/api/v1/providers?lat=25.44&lng=81.85").items | Select-Object shopName, city, distanceKm
```
Na shehar na location (error aayega: "Shehar likho"):
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers"
```
Door ki location (Delhi), Prayagraj ki dukaan nahi aayegi (`0`):
```
(Invoke-RestMethod "http://localhost:5000/api/v1/providers?lat=28.6&lng=77.2").total
```

Browser:
1. `http://localhost:3000` kholo. Browser location maangega → **Allow**. Upar "📍 Aapki location ke hisaab se", neeche "Aapke paas ki dukaanein", card par km.
2. **Location hatao** dabao → "Kaise kaam karta hai" wala page, aur "Meri location se paas ki dukaanein dikhao" button.
3. Location **Block** karke page reload karo → "Location nahi mili... shehar chuno" aur "Dobara try karo".
4. **Prayagraj** button → "Prayagraj ki dukaanein", chips: Top rating, Pure veg, Area (Poora shehar, Civil Lines).
5. **Civil Lines** → card par "Aapke area me". **Pure veg** dabao/hatao.
6. Neeche **Subscription plans** ki row: dono plans, "₹120 roz", "Plan dekho".
7. Header me bhasha हिन्दी / English karke wahi page dekho.
8. Location sirf `localhost` ya `https` par milti hai. Phone ke browser me `http://192.168...:3000` par button "Location nahi mili" dikhayega, ye sahi hai (mobile app me `expo-location` se milegi).

Test ke liye bina GPS location (browser ke DevTools Console me, sirf apne PC par):
```
document.cookie = "tg_loc=25.440,81.850; path=/; max-age=3600"
```
Phir page reload karo.

### Galtiyan aur hal
| Galti | Hal |
|---|---|
| ESLint: "Calling setState synchronously within an effect" (`location-prompt.tsx`) | Effect me seedha `getBrowserLocation().then(...).catch(() => setFailed(true))`, state sirf callback me badalta hai |
| Rating badge "3.3 ★" do line me | Badge par `whitespace-nowrap shrink-0` |
| "1 shops" (English) | Text "(1 found)" kiya, teeno bhasha me |

## 13. Phase 4: dukaan ka page, plan lena, mere subscriptions, pasandida

### Kya bana
- **Dukaan ka page** (`/provider/[id]`): upar photo, naam, area, rating badge, "● Abhi khuli hai / Abhi band hai", Verified, Pure veg, "2 plan". Right me **↗ Share** aur **♡ dil**.
  - **4 tabs** (`?tab=`): **Aaj ka menu** (order form, purana wala), **Plans** (har plan ka card, "Har din ka menu dekho" khol kar poori table, "Ye plan lo"), **Reviews** (5 naye, photo ke saath, "Saare reviews dekho"), **Jaankari** (jagah, khula/band, bharosa, veg, plans, payment).
  - Dukaan **band** ho tab bhi page khulta hai (pehle "band hai" likh kar ruk jata tha). Band dukaan par seedha Plans tab.
- **Share:** phone par apna share menu (WhatsApp waghera), PC par link copy ("Link copy ho gaya").
- **Favourite (♡ → ♥):** dabate hi turant laal (optimistic), login nahi to login page par. `/favourites` par list.
- **Plan ka page** (`/plans/[id]`): plan ki jaankari, daam, "₹120 roz · ₹60 ek khana", poora din-wise menu (PC par table, phone par har din ka card), right me **"Plan lo"** form: shuru ki tareekh (aaj se 30 din, aakhri din apne aap dikhta hai), pata, note, "Paisa abhi seedha dukaan wale ko (COD)". Login nahi to "Login karo" button (login ke baad wapas isi page par).
- **Mere subscriptions** (`/subscriptions`): har subscription ka card, rangin status, tareekh, "Aaj Din 3 hai".
- **Subscription detail** (`/subscriptions/[id]`): status, tareekh, pata, din-wise menu me **aaj ka din orange**, "Request cancel karo" (sirf naye request par). Plan lene ke baad "Request bhej di!" ka hara message.
- Customer ke pages ke upar tabs: **🧾 Orders · 🗓️ Subscriptions · ♥ Pasandida**.
- Front page ke plan card ka "Plan dekho" ab seedha `/plans/[id]` par.

### Backend
- Naya `GET /providers/:id`: dukaan ki public jaankari (approved ho to, band ho tab bhi): `isOpen`, `isVerified`, `isPureVeg`, `planCount`, rating.

### Files
```
backend/routes/publicProviders.ts       ~ GET /providers/:id
web/src/app/provider/[id]/page.tsx      ~ poora naya (tabs)
web/src/app/provider/[id]/actions.ts    ~ toggleFavouriteAction
web/src/app/plans/[id]/page.tsx, subscribe-form.tsx, actions.ts   *
web/src/app/subscriptions/page.tsx, [id]/page.tsx, actions.ts     *
web/src/app/favourites/page.tsx         *
web/src/app/orders/page.tsx             ~ upar CustomerNav
web/src/components/favourite-button.tsx, share-button.tsx, plan-menu-table.tsx, customer-nav.tsx  *
web/src/components/plan-card.tsx        ~ link /plans/[id]
web/src/lib/api.ts                      ~ getShop, getShopPlans, getPlan
web/src/lib/customer.ts                 * subscription type, aaj ka din (India)
web/src/lib/reviews.ts                  ~ photos
web/src/i18n/messages/*.ts              ~ ~70 naye text (shop.*, fav.*, share.*, cnav.*, plan.*, msub.*)
```

### Tests

Backend (PowerShell):
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers/1" | ConvertTo-Json
```
Galat id (error aayega: "Dukaan nahi mili"):
```
Invoke-RestMethod "http://localhost:5000/api/v1/providers/99999"
```

Browser (customer `9999999999` se login):
1. `http://localhost:3000/provider/1` → upar badges, Share, ♡. Tabs badlo: Aaj ka menu, Plans, Reviews, Jaankari.
2. **♡** dabao → ♥ laal. `http://localhost:3000/favourites` par dukaan dikhe. Dobara dabao → hat jaye.
3. **Share** dabao → PC par "Link copy ho gaya" (phone par share menu).
4. **Plans** → "Har din ka menu dekho" → table → **Ye plan lo**.
5. Plan page par tareekh chuno ("Aakhri din" badlega), pata likho → **Plan ki request bhejo** → `/subscriptions/N?new=1`, hara message, "Naya request".
6. **Request cancel karo** → "pakka?" → OK → "Cancel hua", hara message hat jaye.
7. `http://localhost:3000/subscriptions` → saare subscriptions, chalu wale par "Aaj Din 1 hai".
8. Provider (`8888888888`) se `/dashboard/subscriptions` par naya request dikhe → "Chalu karo" → customer ke page par "Chalu" aur aaj ka din orange.
9. Logout karke `/plans/1` kholo → form ki jagah "Login karo" → login ke baad wapas plan page.
10. Dukaan band karke (provider dashboard) `/provider/1` kholo → seedha Plans tab, Aaj ka menu me "dukaan abhi band hai".

### Galtiyan aur hal
| Galti | Hal |
|---|---|
| Cancel ke baad bhi "Request bhej di!" dikhta tha | Cancel action ab `?new=1` ke bina page par redirect karta hai |
| Menu table ke pehle column ka naam "Plan" | Naya text `plan.dayCol` ("Din") |
| "COD" seedha code me likha tha | `shop.infoPay` text, teeno bhasha me |
| Test backend (5001) band karte waqt aapka 5000 wala na ruke | Sirf `npx tsx index.ts` wale process roke, `tsx watch` (aapka) chhoda |

**Test data:** customer `9999999999` ka subscription #2 (cancel hua) aur Sharma Ghar Ka Tiffin favourite me.

## 14. Phase 5: review me photo + baar-baar logout wala bug

### Kya bana (review photo)
- **Review dete waqt** (`/orders/[id]`, delivered order): stars aur comment ke neeche "📷 Khane ki photo jodo (3 tak)". Ek saath kai photo chun sakte ho, preview me × se hata sakte ho.
- Photo **browser me hi chhoti** hoti hai (1000px, 300 KB tak, JPG). Wajah: server action me ek baar me 1 MB tak hi ja sakta hai (Next.js), aur 3 photo saath jaati hain.
- **Review ke baad bhi:** "Aapka review" me photos dikhti hain, × se hatao, "+" se jodo (3 hone par "+" chhup jata hai). Photo dabao to badi photo naye tab me.
- Koi photo fail ho to review nahi rukta. Page par "kuch photo nahi lag payi, neeche se dobara lagao" dikhta hai.
- Photos dikhti hain: dukaan ka Reviews tab, `/provider/[id]/reviews`, aur provider ka `/dashboard/reviews`.

### Bug fix: user apne aap logout ho jata tha
- **Kya hota tha:** access token (14 minute) khatam hone ke baad ek hi page ke do request ek saath purane refresh token se refresh karte the. Backend dusre ko "dobara use hua token" (chori) maan kar **poora session band** kar deta tha. Database me dikha: ek hi second me naya token bana aur usi second band hua (aapke apne browser ke saath bhi hua tha).
- **Doosra chhed:** backend restart ho raha ho (code save par `tsx watch`) to refresh fail hota aur website cookies mita deti thi.
- **Hal:** `web/src/lib/refresh.ts`: ek refresh token ka **ek hi refresh**, saath wale requests usi ka jawab lete hain (60 second yaad). `globalThis` par, taaki route aur pages dono ek hi list dekhein.
  - Backend tak na pahunche (network, 429, 5xx) to **login nahi mitta**. 15 second ke liye `tg_refresh_wait` cookie, taaki redirect ka chakkar na bane.
  - Sirf backend ke "token galat" (401/400) par logout.
- **Test:** ek hi refresh token se `/session/refresh` par 2 request ek saath bheje. Dono ko **same naya token** mila, koi cookie nahi miti, aur naya token baad me bhi chala (200).

### Files
```
web/src/lib/compress-image.ts              * photo chhoti karna (dukaan/dish photo bhi isi se)
web/src/components/photo-uploader.tsx      ~ compress-image use karta hai
web/src/app/orders/actions.ts              ~ review ke saath photos, addReviewPhotoAction, removeReviewPhotoAction
web/src/app/orders/[id]/review-form.tsx    ~ photo chunna (3 tak), preview
web/src/app/orders/[id]/review-photos-editor.tsx  * review ke baad photo jodo/hatao
web/src/app/orders/[id]/page.tsx           ~ editor + "kuch photo fail" message
web/src/components/review-photos.tsx       * review ki photos dikhana
web/src/app/provider/[id]/page.tsx, provider/[id]/reviews/page.tsx, dashboard/reviews/page.tsx  ~ photos
web/src/lib/orders.ts                      ~ review.id, review.photos
web/src/lib/refresh.ts                     * ek token ka ek refresh
web/src/lib/authed.ts, lib/session.ts, app/session/refresh/route.ts  ~ refreshOnce, network par logout nahi
web/src/i18n/messages/*.ts                 ~ rphoto.* (7 text)
```

### Tests

Browser (customer `9999999999`):
1. `http://localhost:3000/orders` → koi **Delivered** order bina review ke kholo.
2. Stars do, comment likho, **"+"** dabakar 1-3 photo chuno → preview → **Review bhejo**.
3. "Aapka review" me photos. Ek par **×** → hat jaye. **"+"** se nayi lagao. 3 hone par "+" gayab.
4. Photo par click → badi photo naye tab me.
5. `http://localhost:3000/provider/1?tab=reviews` aur provider ke `/dashboard/reviews` par wahi photos.
6. Badi photo (5-10 MB) chuno → phir bhi lag jaye (browser chhota karta hai).

Logout bug (PowerShell, `backend` folder, backend chalu ho):
Login karke 15 minute ruko (ya browser DevTools → Application → Cookies me `tg_access` delete karo), phir koi bhi page kholo. Login bana rehna chahiye. Backend band karke page kholo → thodi der "Login" dikhega, backend chalu karne ke 15 second baad wapas login dikhna chahiye (pehle cookies mit jati thi).

Database me refresh tokens dekhna (Prisma Studio):
```
npx prisma studio
```
`RefreshToken` table: ek hi `familyId` me naya token banta hai aur purana `revokedAt` leta hai. Ek hi second me naya bana aur band hua ho to wahi purana bug tha.

### Galtiyan aur hal
| Galti | Hal |
|---|---|
| Baar-baar logout | `lib/refresh.ts` (upar) |
| Client component me `photoSrc` galat link de sakta tha (`API_URL` server ka env hai) | Photo ka poora link server par bana kar client ko diya |
| Node script me `\\d` se `\d` ki jagah `d` likha gaya | `isId()` helper |
| Bash me `wait` ne background server ka bhi intezaar kiya (atak gaya) | Test me server ke saath `wait` mat lagao |

**Test data:** order #8 par 4 star review, 2 test photo ke saath (Thali, Dal).

## 15. Phase 6: naya design (rang, font, status badge, timeline)

### Kya badla
- **Ek jaise status ke rang, har jagah** (`lib/orders.ts` → `ORDER_STATUS_STYLE`, `ORDER_STATUS_ICON`):
  🧾 Naya = neela, 👍 Accept = halka neela, 🍳 Ban raha = peela, 🛵 Raaste me = baingani, ✅ Pahuncha = hara, ✖ Mana/Cancel = laal/grey. Component: `components/order-status.tsx` → `OrderStatusBadge`.
- **Mere orders** (`/orders`): har order ka card: dukaan, `#id · tareekh`, dishes ki ek line, rangin badge, bada total, "Dekho →". Khali ho to 🍱 aur "Dukaanein dekho" button.
- **Order detail** (`/orders/[id]`): upar badge, **timeline** (Order diya → Accept → Ban raha → Raaste me → Pahuncha; ho chuke hare ✓, abhi wala orange chamakta hai), phir "Kya mangaya" aur "Delivery" ke alag card. Mana/cancel par timeline ki jagah rangin dabba. Review ka hissa halke orange card me.
- Badge aur timeline ke liye **chhote naam** (`step.*`: "Ban raha", "Raaste me"), lamba text ("Order mil gaya, dukaan ke jawab ka intezaar") detail page par.
- **Provider ke orders:** rangin badge, naya order neeli border se alag dikhe, customer ki jaankari grey dabbe me, "Accept" hara aur "Mana" laal button, filter chips gol.
- **Dashboard, menu, reviews, admin:** sab card `rounded-2xl` + halki shadow, khula/band hara/grey, admin ke stats rangin dabbon me icon ke saath, dukaan ke status ka rangin badge.
- **Header:** gol pills wale links, phone number ka chhota badge. **Phone par** 2 line: upar logo, neeche links ki scroll hone wali line (pehle har link alag line me aata tha).
- **Footer:** logo, tagline, "Jaldi pahuncho" links (Home, Mere orders, Subscriptions, Dukaan kholo), `© saal Tiffin Ghar`.
- **Login:** safed card, Customer/Dukaan wala ka segmented tab, upar 🍱/🏪, neeche "OTP kisi ko mat batao".
- **Order form:** chuni hui dish orange border se highlight, bade +/− button, phone par "Order karo" wala dabba neeche chipka rehta hai.
- **Font aur padhne me aasani** (`globals.css`): heading thode kase hue aur do barabar line me tootte hain, Hindi par zyada line-height, keyboard focus ka orange outline, select karne par orange rang, scroll wali lines me scrollbar chhupa (`no-scrollbar`).
- Dukaan ke page ke tabs sirf PC par chipakte hain (phone par header ooncha hai).

### Files
```
web/src/app/globals.css                   ~ base styles, Hindi line-height, no-scrollbar
web/src/lib/orders.ts                     ~ ORDER_STATUS_STYLE, ORDER_STATUS_ICON, ORDER_STEPS, STEP_KEY
web/src/components/order-status.tsx       * OrderStatusBadge, OrderTimeline
web/src/components/site-header.tsx, site-footer.tsx, language-switcher.tsx, dashboard-link.tsx, dash-nav.tsx, customer-nav.tsx  ~
web/src/app/orders/page.tsx, orders/[id]/page.tsx  ~
web/src/app/dashboard/page.tsx, dashboard/orders/page.tsx, dashboard/menu/page.tsx, dashboard/reviews/page.tsx  ~
web/src/app/admin/page.tsx                ~ (sirf Hinglish, niyam ke hisaab se)
web/src/app/login/page.tsx                ~
web/src/app/provider/[id]/order-form.tsx, provider/[id]/page.tsx, provider/[id]/reviews/page.tsx, app/page.tsx  ~
web/src/i18n/messages/*.ts                ~ step.*, orders.emptyCta/view/status/itemsTitle/deliveryTitle, footer.links/copy, login.secure
```

### Tests (browser)
1. `http://localhost:3000/orders` → rangin badge wale card. Koi order na ho to 🍱 aur "Dukaanein dekho".
2. Koi chalu order kholo → timeline (hare ✓, orange abhi wala). Provider se status badlo → 15 second me timeline aage badhe.
3. Cancel/mana wala order → timeline ki jagah rangin dabba.
4. Provider (`8888888888`) → `/dashboard/orders` → naya order neeli border, Accept hara, Mana laal.
5. Admin (`6666666666`) → `/admin` → rangin stats aur badge.
6. Logout → `/login` → card, segmented tab.
7. **Phone size:** Chrome DevTools (F12) → phone icon (Toggle device) → iPhone → header 2 line me, chips side me scroll, scrollbar nahi.
8. Header me bhasha हिन्दी karke dekho: Hindi text ki line ki doori zyada, kat-ta nahi.

Check commands:
```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\web"
```
```
npx tsc --noEmit
```
```
npx eslint src
```

### Galtiyan aur hal
| Galti | Hal |
|---|---|
| Phone par header ke links ek ke neeche ek | Phone par 2 line: logo, phir scroll hone wali links ki line |
| Scroll wali chips ke neeche grey scrollbar | `@utility no-scrollbar` (`globals.css`) |
| Customer ke status text badge ke liye bahut lambe | Chhote naam `step.*` |
| `admin/page.tsx` me text badalne wala script match nahi hua | File CRLF (Windows line ending) me thi; script ab CRLF sambhalta hai |
| Dukaan ke tabs phone par header ke peeche chhupte | Sirf `sm:` (PC) par sticky |

## 16. Mobile Step 3: OTP login

### Kya bana
- **Login screen** (`mobile/src/app/login.tsx`): pehle mobile number (sirf 10 ank, 6-9 se shuru, galat ho to "Sahi 10 digit ka mobile number daalo"), phir **OTP**. OTP box bada hai, ank fail kar dikhte hain, aur phone ka "OTP apne aap bharo" (`oneTimeCode`) chalta hai.
- **"OTP dobara bhejo"** 60 second ka countdown ke saath (backend bhi 60 second me ek hi OTP bhejta hai). "Number badlo" button.
- Login hote hi tokens phone ke **secure storage** me (`tg_access`, `tg_refresh`), aur jis screen se aaye the wahin wapas.
- **App band karke kholo, login bana rehta hai** (`AuthProvider` app khulte hi `/me` se user lata hai).
- **Session khatam** (refresh token bekaar) ho to app apne aap "guest" ban jata hai (`onSessionEnded`).
- **Backend band** ho to login nahi mitta: "Server se jud nahi paye, aapka login bana hai" aur "Dobara try karo".
- **Logout:** backend par refresh token band, phir phone se hatao (backend na mile tab bhi phone se hat jata hai).
- **Bhasha sync** (website jaisa): phone par bhasha pehle se chuni ho to wo database me jaati hai, warna database wali bhasha phone par lag jaati hai.
- Home par upar **AccountBar**: guest ko "Order aur plan ke liye login karo" + Login button, login wale ko "👋 Namaste! 9999999999 se login hai" + Logout. Provider ko note: "Dukaan ka dashboard abhi website par hai".
- **Reusable UI** (`src/components/ui.tsx`): `Button` (orange / outline, loading), `Field` (label + input), `ErrorText`, `Card`. Rang `src/lib/theme.ts` me (website jaise). Aage ki saari screens yahi use karengi.

### Files (`mobile/src/`)
```
lib/auth.ts                 * sendOtp, verifyOtp (tokens save), fetchMe, logout, PHONE_RE, OTP_RE
lib/theme.ts                * rang aur kone (website jaise)
auth/provider.tsx           * AuthProvider, useAuth (loading / guest / offline / user)
app/login.tsx               * login screen
app/_layout.tsx             ~ AuthProvider, header ke rang
app/index.tsx               ~ upar AccountBar
components/AccountBar.tsx   * login / logout ka hissa
components/ui.tsx           * Button, Field, ErrorText, Card
i18n/provider.tsx, index.ts ~ syncAfterLogin, useSyncLanguage
web/src/i18n/messages/*.ts  ~ login.resend, login.resendIn, login.sent, mlogin.* (mobile bhi yahi padhta hai)
```
Backend me koi badlav nahi (login API pehle se tokens JSON me deti hai).

### Tests (phone par, Expo Go)

Backend aur app chalao:
```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\backend"
```
```
npm run dev
```
```
cd "C:\Users\Ravi Kumar patel\tiffin-ghar\mobile"
```
```
npx expo start --clear
```
1. QR scan → home par "Order aur plan ke liye login karo" + **Login**.
2. Login → `12345` likho → button band rehta hai. `9999999999` → **OTP bhejo**.
3. OTP backend ke terminal me (`OTP for 9999999999: ......`) → daalo → **Login karo** → home par "👋 Namaste! 9999999999 se login hai".
4. Galat OTP → chuni bhasha me "OTP galat hai".
5. "OTP dobara bhejo" par 60 se ulti ginti, phir dabta hai.
6. Expo Go poori tarah band karke kholo → login bana rahe.
7. Backend band karke `r` (reload) → "Server se jud nahi paye, aapka login bana hai" → backend chalu → **Dobara try karo** → wapas login dikhe.
8. **Logout** → guest. Website par bhi us number ka purana session alag hai (alag token family), wo chalta rahega.
9. Bhasha: app me हिन्दी chuno, phir logout aur login → website par us user ki bhasha bhi हिन्दी (header me) dikhe.
10. `8888888888` se login → "Dukaan ka dashboard abhi website par hai".

Check commands (`mobile` folder):
```
npx tsc --noEmit
```
```
npx expo-doctor
```

### Galtiyan aur hal
| Galti | Hal |
|---|---|
| `tsc`: `"/login"` route type me nahi (typed routes) | Typed routes ki file `.expo/types/router.d.ts` sirf `npx expo start` banata hai. Nayi screen ke baad ek baar `npx expo start` chalao, phir `tsc` |
| `npx expo lint` pehli baar ESLint install karne ka sawaal poochta hai | Abhi nahi chalaya. Chahiye to baad me `npx expo lint` chala kar "yes" |

## 17. Naye chat me ye paste karo (hamesha aakhri section)

> Mai Tiffin Ghar naam ka tiffin service app bana raha hu (Node.js + Express + TypeScript, PostgreSQL, Prisma 7.10.0, Next.js 16 website, React Native Expo mobile app). Project ki `CLAUDE.md` padho. Notes files `docs/notes/` me hain, sabse nayi `tiffin-ghar-project-notes-step8.md`. Mobile Step 1-2, Phase 1 (backend: location sorting, subscription plans din-wise menu ke saath, favourite, review photo) aur Phase 2 (provider dashboard: location, nashta/lunch/dinner, plans ka grid, subscriptions, suggestion chips) Phase 3 (front page: location se paas ki dukaan, top rating, area, pure veg, naya card, plans ki row) Phase 4 (dukaan ke tabs, plan lena, mere subscriptions, favourite, share) Phase 5 (review me photo, baar-baar logout ka bug fix) Phase 6 (naya design: status ke rang, order timeline, header/footer, login) aur Mobile Step 3 (OTP login) ho gaye. Ab Mobile Step 4 (dukaan list, location) karna hai. Hinglish me step by step samjhao, har badlav ke baad kya badla, kyon aur kaun si file batao, saari test commands (PowerShell, ek line me ek) aur browser ke steps do, aur notes file me naya section jodo.
