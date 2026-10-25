import { api } from "./api";
import type { MealTime } from "./meals";
import type { ShopPlan } from "./shops";

// ---------- Orders ----------

export type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "REJECTED" | "CANCELLED";

export type Order = {
  id: number;
  status: OrderStatus;
  totalPaise: number;
  deliveryAddress: string;
  note: string | null;
  createdAt: string;
  provider: { id: number; shopName: string };
  items: { id: number; name: string; pricePaise: number; quantity: number }[];
  review: { id: number; rating: number; comment: string | null } | null;
};

export function getOrders(page = 1) {
  return api<{ items: Order[]; total: number }>(`/orders?page=${page}&limit=20`, { auth: true });
}

export function getOrder(id: string) {
  return api<Order>(`/orders/${encodeURIComponent(id)}`, { auth: true });
}

export function cancelOrder(id: number) {
  return api<Order>(`/orders/${id}/cancel`, { method: "PATCH", auth: true });
}

// ---------- Subscription plan (public) ----------

export type PlanDetail = ShopPlan & {
  provider: { id: number; shopName: string; area: string | null; rating: number | null; ratingCount: number };
};

export function getPlan(id: string) {
  return api<PlanDetail>(`/plans/${encodeURIComponent(id)}`);
}

// ---------- Subscriptions (customer) ----------

export type SubscriptionStatus = "REQUESTED" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED";

export type Subscription = {
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
  provider: { id: number; shopName: string; area: string | null; city: string };
  dayMenus?: { day: number; mealTime: MealTime; dishes: string[] }[];
};

export function subscribe(body: { planId: number; startDate: string; deliveryAddress: string; note?: string }) {
  return api<Subscription>("/subscriptions", { method: "POST", body, auth: true });
}

export function getSubscriptions() {
  return api<{ items: Subscription[] }>("/subscriptions?limit=50", { auth: true });
}

export function getSubscription(id: string) {
  return api<Subscription>(`/subscriptions/${encodeURIComponent(id)}`, { auth: true });
}

export function cancelSubscription(id: number) {
  return api<Subscription>(`/subscriptions/${id}/cancel`, { method: "PATCH", auth: true });
}

// ---------- Tareekh (India ke hisaab se, "2026-10-25") ----------

const IST_MS = 5.5 * 60 * 60 * 1000;

export function todayInIndia() {
  return new Date(Date.now() + IST_MS).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Plan ka aaj kaun sa din: 1..days, shuru nahi hua to 0, khatam to null
export function currentPlanDay(startIso: string, days: number): number | null {
  const diff = Math.round(
    (Date.parse(`${todayInIndia()}T00:00:00Z`) - Date.parse(`${startIso.slice(0, 10)}T00:00:00Z`)) / 86_400_000,
  );
  if (diff < 0) return 0;
  if (diff >= days) return null;
  return diff + 1;
}
