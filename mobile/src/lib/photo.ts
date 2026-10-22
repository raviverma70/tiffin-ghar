import { API_URL } from "./config";

// "http://192.168.1.5:5000/api/v1" -> "http://192.168.1.5:5000" (photos /uploads par hain, /api/v1 par nahi)
const ORIGIN = /^https?:\/\/[^/]+/.exec(API_URL)?.[0] ?? API_URL;

// Database me sirf "/uploads/<naam>" hota hai, poora link yahan banta hai
export function photoSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${ORIGIN}${url}`;
}
