import type { MealTime, SubscriptionStatus } from "@/lib/provider";
import type { DayMenu } from "@/lib/api";

// Customer ka subscription (backend /subscriptions)
export type CustomerSubscription = {
  id: number;
  planId: number;
  planName: string;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  startDate: string;
  deliveryAddress: string;
  note: string | null;
  status: SubscriptionStatus;
  createdAt: string;
  provider: { id: number; shopName: string; area: string | null; city: string };
  dayMenus?: DayMenu[];
};

// Aaj ki tareekh India me: "2026-10-24"
export function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

// "2026-10-24" + n din
export function addDaysIso(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Plan ka aaj kaun sa din hai (1 se days), shuru nahi hua to 0, khatam ho gaya to null
export function currentPlanDay(startIso: string, days: number): number | null {
  const start = startIso.slice(0, 10);
  const diff = Math.round(
    (Date.parse(`${todayInIndia()}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000,
  );
  if (diff < 0) return 0;
  if (diff >= days) return null;
  return diff + 1;
}
