import type { MessageKey } from "@/i18n/messages/hinglish";
import type { OrderItem, OrderStatus } from "@/lib/orders";

export type ProviderProfile = {
  id: number;
  shopName: string;
  city: string;
  address: string;
  pincode: string;
  fssaiNumber: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isOpen: boolean;
  photoUrl: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type DashMenuItem = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  dayOfWeek: number | null;
  isVeg: boolean;
  isAvailable: boolean;
  photoUrl: string | null;
  mealTime: MealTime;
};

export type ProviderOrder = {
  id: number;
  status: OrderStatus;
  paymentMethod: string;
  totalPaise: number;
  deliveryAddress: string;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
  user: { phone: string };
};

// 0 = Ravivar ... 6 = Shanivar (bhasha ki keys)
export const DAY_KEYS: MessageKey[] = [
  "day.0",
  "day.1",
  "day.2",
  "day.3",
  "day.4",
  "day.5",
  "day.6",
];

// Provider ko status aise dikhte hain
export const PROVIDER_STATUS_KEY: Record<OrderStatus, MessageKey> = {
  PLACED: "pstatus.PLACED",
  ACCEPTED: "pstatus.ACCEPTED",
  PREPARING: "pstatus.PREPARING",
  OUT_FOR_DELIVERY: "pstatus.OUT_FOR_DELIVERY",
  DELIVERED: "pstatus.DELIVERED",
  REJECTED: "pstatus.REJECTED",
  CANCELLED: "pstatus.CANCELLED",
};

export type NextStatus = "ACCEPTED" | "REJECTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";

// Backend ke ALLOWED_FROM jaisa hi: kis status se aage kya ho sakta hai
export const NEXT_STATUSES: Partial<Record<OrderStatus, NextStatus[]>> = {
  PLACED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING", "REJECTED"],
  PREPARING: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export const ACTION_KEY: Record<NextStatus, MessageKey> = {
  ACCEPTED: "action.ACCEPTED",
  REJECTED: "action.REJECTED",
  PREPARING: "action.PREPARING",
  OUT_FOR_DELIVERY: "action.OUT_FOR_DELIVERY",
  DELIVERED: "action.DELIVERED",
};

export const FILTERS: { value: OrderStatus | ""; key: MessageKey }[] = [
  { value: "", key: "filter.all" },
  { value: "PLACED", key: "filter.PLACED" },
  { value: "ACCEPTED", key: "filter.ACCEPTED" },
  { value: "PREPARING", key: "filter.PREPARING" },
  { value: "OUT_FOR_DELIVERY", key: "filter.OUT_FOR_DELIVERY" },
  { value: "DELIVERED", key: "filter.DELIVERED" },
  { value: "REJECTED", key: "filter.REJECTED" },
  { value: "CANCELLED", key: "filter.CANCELLED" },
];

// "85" ya "85.50" (rupaye) -> 8500 ya 8550 (paise). Galat likha ho to null.
export function rupeesToPaise(input: string): number | null {
  const s = input.trim().replace(/^₹\s*/, "");
  const m = /^(\d{1,5})(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
}

// 8500 -> "85", 8550 -> "85.50" (edit form ke liye)
export function paiseToRupees(paise: number) {
  const r = paise / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2);
}

// ---------- Khane ka time ----------

export type MealTime = "BREAKFAST" | "LUNCH" | "DINNER";
export const MEAL_TIMES: MealTime[] = ["BREAKFAST", "LUNCH", "DINNER"];

export const MEAL_KEY: Record<MealTime, MessageKey> = {
  BREAKFAST: "meal.BREAKFAST",
  LUNCH: "meal.LUNCH",
  DINNER: "meal.DINNER",
};

export const MEAL_SHORT_KEY: Record<MealTime, MessageKey> = {
  BREAKFAST: "mealShort.BREAKFAST",
  LUNCH: "mealShort.LUNCH",
  DINNER: "mealShort.DINNER",
};

export const MEAL_ICON: Record<MealTime, string> = {
  BREAKFAST: "🌅",
  LUNCH: "☀️",
  DINNER: "🌙",
};

export function isMealTime(value: unknown): value is MealTime {
  return typeof value === "string" && (MEAL_TIMES as string[]).includes(value);
}

// ---------- Subscription plans ----------

export type PlanDayMenu = { day: number; mealTime: MealTime; dishes: string[] };

export type ProviderPlan = {
  id: number;
  name: string;
  description: string | null;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  isVeg: boolean;
  isActive: boolean;
  dayMenus: PlanDayMenu[];
  _count: { subscriptions: number };
};

export function menuSlots(plan: { days: number; mealTimes: MealTime[] }) {
  return plan.days * plan.mealTimes.length;
}

// ---------- Subscriptions ----------

export type SubscriptionStatus = "REQUESTED" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED";

export type ProviderSubscription = {
  id: number;
  planName: string;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  startDate: string;
  deliveryAddress: string;
  note: string | null;
  status: SubscriptionStatus;
  createdAt: string;
  user: { phone: string };
};

export const SUB_STATUS_KEY: Record<SubscriptionStatus, MessageKey> = {
  REQUESTED: "sstatus.REQUESTED",
  ACTIVE: "sstatus.ACTIVE",
  COMPLETED: "sstatus.COMPLETED",
  REJECTED: "sstatus.REJECTED",
  CANCELLED: "sstatus.CANCELLED",
};

export type SubAction = "ACTIVE" | "REJECTED" | "COMPLETED" | "CANCELLED";

// Backend ke ALLOWED_FROM jaisa hi
export const SUB_NEXT: Partial<Record<SubscriptionStatus, SubAction[]>> = {
  REQUESTED: ["ACTIVE", "REJECTED"],
  ACTIVE: ["COMPLETED", "CANCELLED"],
};

export const SUB_ACTION_KEY: Record<SubAction, MessageKey> = {
  ACTIVE: "subs.act.ACTIVE",
  REJECTED: "subs.act.REJECTED",
  COMPLETED: "subs.act.COMPLETED",
  CANCELLED: "subs.act.CANCELLED",
};

export const SUB_STATUSES: SubscriptionStatus[] = ["REQUESTED", "ACTIVE", "COMPLETED", "REJECTED", "CANCELLED"];

// Status ke rang (badge)
export const SUB_STATUS_STYLE: Record<SubscriptionStatus, string> = {
  REQUESTED: "bg-blue-50 text-blue-700 ring-blue-200",
  ACTIVE: "bg-green-50 text-green-700 ring-green-200",
  COMPLETED: "bg-gray-100 text-gray-700 ring-gray-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};
