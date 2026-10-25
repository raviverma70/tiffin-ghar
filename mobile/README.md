# Tiffin Ghar mobile app (Expo)

Wahi backend (`backend/`) aur wahi bhasha ki files (`web/src/i18n/`) use karta hai.

## Pehli baar setup

1. Phone me **Expo Go** daalo (Settings me SDK **57** hona chahiye).
2. Phone aur PC ek hi Wi-Fi par (ya PC phone ke hotspot par) hon.
3. `npm install`
4. (Sirf `--tunnel` ke liye) `mobile/` me `.env` file, ek line:

   ```
   EXPO_PUBLIC_API_URL=http://<PC-ka-IP>:5000/api/v1
   ```

   **Development me iski zaroorat nahi:** app khud wahi IP leta hai jis par Expo chal raha hai (`src/lib/config.ts`), port 5000. Wi-Fi/hotspot badle aur IP badle tab bhi kuch nahi badalna. `.env` sirf tab kaam aata hai jab `npx expo start --tunnel` ho (tunnel me IP nahi milta).

## Chalana

- Backend: `backend/` me `npm run dev`
- App: `mobile/` me `npx expo start`, phir Expo Go se QR code scan karo.
- `metro.config.js` ya nayi screen ke baad: `npx expo start --clear`

## Server se jud nahi paye?

Home par error ke neeche `API: http://...` likha aata hai (sirf development me). Wo address PC ke browser me kholo (`http://<IP>:5000/api/v1/providers/cities`):
- PC par bhi na khule: backend chalu nahi hai.
- PC par khule, phone par nahi: Windows Firewall port 5000 rok raha hai, ya phone dusre Wi-Fi par hai.

Har request 15 second me jawab na de to ruk jati hai aur error dikhata hai (pehle spinner atka rehta tha).

## Check

- `npx tsc --noEmit` (kuch print na ho; nayi screen ke baad pehle ek baar `npx expo start`, taaki typed routes ban jayein)
- `npx expo-doctor`
