import Constants from "expo-constants";

const BACKEND_PORT = 5000;

// Development me: jis IP se Expo ne app phone par khola (PC ka Wi-Fi IP), wahi IP backend ka bhi.
// Isse Wi-Fi/hotspot badalne par IP badle to bhi .env badalna nahi padta.
// "--tunnel" me host IP nahi, naam hota hai: tab .env wala URL.
function devApiUrl(): string | null {
  if (!__DEV__) return null;
  const hostUri = Constants.expoConfig?.hostUri; // jaise "10.133.123.9:8081"
  const host = hostUri?.split(":")[0];
  if (!host || !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  return `http://${host}:${BACKEND_PORT}/api/v1`;
}

// .env ka EXPO_PUBLIC_API_URL (dot se hi padhna, tabhi Expo use app me daalta hai)
const fromEnv = process.env.EXPO_PUBLIC_API_URL;

const url = devApiUrl() ?? fromEnv;

if (!url) {
  throw new Error("mobile/.env me EXPO_PUBLIC_API_URL nahi mila (mobile/README.md dekho)");
}

export const API_URL = url.replace(/\/+$/, "");
