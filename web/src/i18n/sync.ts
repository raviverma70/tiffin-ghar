import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import { LOCALE_COOKIE, isLocale } from "./config";
import { LOCALE_COOKIE_OPTIONS } from "./server";

// Login ke baad: browser me chuni bhasha ho to database me save karo,
// nahi to database ki bhasha browser me lagao. Fail ho to login nahi rukta.
export async function syncLanguageAfterLogin(accessToken: string): Promise<void> {
  try {
    const store = await cookies();
    const current = store.get(LOCALE_COOKIE)?.value;
    const headers = { Authorization: `Bearer ${accessToken}` };

    const res = await fetch(`${API_URL}/me`, { headers, cache: "no-store" });
    const me = res.ok ? ((await res.json()) as { language?: string | null }) : null;
    const saved = me?.language;

    if (isLocale(current)) {
      if (current !== saved) {
        await fetch(`${API_URL}/me/language`, {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ language: current }),
          cache: "no-store",
        });
      }
    } else if (isLocale(saved)) {
      store.set(LOCALE_COOKIE, saved, LOCALE_COOKIE_OPTIONS);
    }
  } catch {
    // koi baat nahi
  }
}
