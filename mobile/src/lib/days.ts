import type { MessageKey } from "@/i18n";

// 0 = Ravivar ... 6 = Shanivar (website ke DAY_KEYS jaisa)
export const DAY_KEY: MessageKey[] = ["day.0", "day.1", "day.2", "day.3", "day.4", "day.5", "day.6"];

// Tareekh user ki bhasha me (India ke time se)
export function formatDate(iso: string, locale: string) {
  const intl = locale === "hi" ? "hi-IN" : "en-IN";
  try {
    return new Date(iso).toLocaleDateString(intl, { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}
