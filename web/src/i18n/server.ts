import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { translateError } from "./errors";
import { messagesFor } from "./messages";
import { makeT } from "./translate";

export const LOCALE_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// Server pages aur actions me: const { t } = await getT();
export async function getT() {
  const locale = await getLocale();
  const messages = messagesFor(locale);
  return { t: makeT(messages), locale, messages };
}

// Backend ke jawab ka error, user ki bhasha me
export async function apiError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  const { t } = await getT();
  const message = typeof data?.error === "string" ? data.error : "";
  return message ? translateError(t, message) : t("err.generic");
}
