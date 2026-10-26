import { api } from "./api";
import type { MealTime } from "./meals";
import type { OrderStatus, SubscriptionStatus } from "./orders";
import type { MessageKey } from "@/i18n";

// Dukaan wale (PROVIDER) ki API: sab "/providers/me/..." aur login + role zaroori

export type MyShop = {
  id: number;
  shopName: string;
  city: string;
  area: string | null;
  pincode: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isOpen: boolean;
  latitude: number | null;
  longitude: number | null;
};

export function getMyShop() {
  return api<MyShop>("/providers/me", { auth: true });
}

export function setShopOpen(isOpen: boolean) {
  return api<MyShop>("/providers/me/open", { method: "PATCH", body: { isOpen }, auth: true });
}

// ---------- Orders ----------

export type ShopOrder = {
  id: number;
  status: OrderStatus;
  totalPaise: number;
  deliveryAddress: string;
  note: string | null;
  createdAt: string;
  items: { id: number; name: string; pricePaise: number; quantity: number }[];
  user: { phone: string };
};

export function getShopOrders(status?: OrderStatus) {
  return api<{ items: ShopOrder[]; total: number }>(
    `/providers/me/orders?limit=50${status ? `&status=${status}` : ""}`,
    { auth: true },
  );
}

export type NextStatus = "ACCEPTED" | "REJECTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";

export function setOrderStatus(id: number, status: NextStatus) {
  return api<ShopOrder>(`/providers/me/orders/${id}/status`, { method: "PATCH", body: { status }, auth: true });
}

// Backend ke ALLOWED_FROM jaisa (website ke lib/provider.ts jaisa)
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

export const PROVIDER_STATUS_KEY: Record<OrderStatus, MessageKey> = {
  PLACED: "pstatus.PLACED",
  ACCEPTED: "pstatus.ACCEPTED",
  PREPARING: "pstatus.PREPARING",
  OUT_FOR_DELIVERY: "pstatus.OUT_FOR_DELIVERY",
  DELIVERED: "pstatus.DELIVERED",
  REJECTED: "pstatus.REJECTED",
  CANCELLED: "pstatus.CANCELLED",
};

export const ORDER_FILTERS: { value: OrderStatus | undefined; key: MessageKey }[] = [
  { value: undefined, key: "filter.all" },
  { value: "PLACED", key: "filter.PLACED" },
  { value: "ACCEPTED", key: "filter.ACCEPTED" },
  { value: "PREPARING", key: "filter.PREPARING" },
  { value: "OUT_FOR_DELIVERY", key: "filter.OUT_FOR_DELIVERY" },
  { value: "DELIVERED", key: "filter.DELIVERED" },
  { value: "REJECTED", key: "filter.REJECTED" },
  { value: "CANCELLED", key: "filter.CANCELLED" },
];

// ---------- Subscriptions ----------

export type ShopSubscription = {
  id: number;
  planName: string;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  startDate: string;
  deliveryAddress: string;
  note: string | null;
  status: SubscriptionStatus;
  user: { phone: string };
};

export function getShopSubscriptions(status?: SubscriptionStatus) {
  return api<{ items: ShopSubscription[]; total: number }>(
    `/providers/me/subscriptions?limit=50${status ? `&status=${status}` : ""}`,
    { auth: true },
  );
}

export type SubAction = "ACTIVE" | "REJECTED" | "COMPLETED" | "CANCELLED";

export function setSubscriptionStatus(id: number, status: SubAction) {
  return api<ShopSubscription>(`/providers/me/subscriptions/${id}/status`, {
    method: "PATCH",
    body: { status },
    auth: true,
  });
}

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

export const SUB_FILTERS: { value: SubscriptionStatus | undefined; key: MessageKey }[] = [
  { value: undefined, key: "subs.filterAll" },
  { value: "REQUESTED", key: "sstatus.REQUESTED" },
  { value: "ACTIVE", key: "sstatus.ACTIVE" },
  { value: "COMPLETED", key: "sstatus.COMPLETED" },
  { value: "REJECTED", key: "sstatus.REJECTED" },
  { value: "CANCELLED", key: "sstatus.CANCELLED" },
];
