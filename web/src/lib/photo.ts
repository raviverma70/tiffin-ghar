import { API_URL } from "@/lib/api";

export function photoSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${new URL(API_URL).origin}${url}`;
}