import type { MessageKey } from "@/i18n";

// Website ke lib/provider.ts jaisa (wahan se seedha import nahi hota, "@/..." mobile me alag jagah hai)
export type MealTime = "BREAKFAST" | "LUNCH" | "DINNER";

export const MEAL_ICON: Record<MealTime, string> = {
  BREAKFAST: "🌅",
  LUNCH: "☀️",
  DINNER: "🌙",
};

export const MEAL_SHORT_KEY: Record<MealTime, MessageKey> = {
  BREAKFAST: "mealShort.BREAKFAST",
  LUNCH: "mealShort.LUNCH",
  DINNER: "mealShort.DINNER",
};
