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
