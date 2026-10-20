// Server aur client dono me chalta hai (koi server import nahi)
export const LOCALES = ["hinglish", "hi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "hinglish";
export const LOCALE_COOKIE = "tg_lang";

export const LOCALE_LABEL: Record<Locale, string> = {
  hinglish: "Hinglish",
  hi: "हिन्दी",
  en: "English",
};

// <html lang="...">
export const HTML_LANG: Record<Locale, string> = {
  hinglish: "hi-Latn",
  hi: "hi",
  en: "en",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
