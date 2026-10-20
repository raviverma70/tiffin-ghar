import type { Locale } from "@/i18n/config";

const INTL_LOCALE: Record<Locale, string> = {
  hinglish: "en-IN",
  hi: "hi-IN",
  en: "en-IN",
};

// Paise ko rupaye me dikhao: 8500 -> ₹85
export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

// Tareekh user ki bhasha me (locale na do to purane jaisa)
export function formatDate(iso: string, locale: Locale = "hinglish") {
  return new Date(iso).toLocaleString(INTL_LOCALE[locale], {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
