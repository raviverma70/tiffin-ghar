// .env ka EXPO_PUBLIC_API_URL (dot se hi padhna, tabhi Expo use app me daalta hai)
const url = process.env.EXPO_PUBLIC_API_URL;

if (!url) {
  throw new Error("mobile/.env me EXPO_PUBLIC_API_URL nahi mila (mobile/README.md dekho)");
}

export const API_URL = url.replace(/\/+$/, "");
