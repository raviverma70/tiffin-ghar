# Tiffin Ghar mobile app (Expo)

Wahi backend (`backend/`) aur wahi bhasha ki files (`web/src/i18n/`) use karta hai.

## Pehli baar setup

1. `mobile/` folder me `.env` naam ki file banao (GitHub par nahi jaati). Usme ek line:

   ```
   EXPO_PUBLIC_API_URL=http://<PC-ka-IP>:5000/api/v1
   ```

   PC ka IP PowerShell me `ipconfig` chalakar Wi-Fi ke "IPv4 Address" se milega. Phone par `localhost` nahi chalega, wo phone khud hota hai.
2. Phone aur PC ek hi Wi-Fi par hon. Phone me **Expo Go** app daalo.
3. `npm install`

## Chalana

- Backend: `backend/` me `npm run dev`
- App: `mobile/` me `npx expo start`, phir phone ke Expo Go se QR code scan karo.
- `.env` ya `metro.config.js` badla ho to: `npx expo start --clear`

## Check

- `npx tsc --noEmit` (kuch print na ho)
- `npx expo-doctor`
