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

export const DAY_NAMES = [
  "Ravivar",
  "Somvar",
  "Mangalvar",
  "Budhvar",
  "Guruvar",
  "Shukravar",
  "Shanivar",
];

// Provider ko status aise dikhte hain (customer wale label se alag)
export const PROVIDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: "Naya order",
  ACCEPTED: "Accept kiya",
  PREPARING: "Ban raha hai",
  OUT_FOR_DELIVERY: "Raaste me hai",
  DELIVERED: "Pahunch gaya",
  REJECTED: "Mana kiya",
  CANCELLED: "Customer ne cancel kiya",
};

export type NextStatus = "ACCEPTED" | "REJECTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";

// Backend ke ALLOWED_FROM jaisa hi: kis status se aage kya ho sakta hai
export const NEXT_STATUSES: Partial<Record<OrderStatus, NextStatus[]>> = {
  PLACED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING", "REJECTED"],
  PREPARING: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export const ACTION_LABEL: Record<NextStatus, string> = {
  ACCEPTED: "Accept karo",
  REJECTED: "Mana karo",
  PREPARING: "Ban raha hai",
  OUT_FOR_DELIVERY: "Raaste me hai",
  DELIVERED: "Pahunch gaya",
};

export const FILTERS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Sab" },
  { value: "PLACED", label: "Naye" },
  { value: "ACCEPTED", label: "Accept kiye" },
  { value: "PREPARING", label: "Ban raha hai" },
  { value: "OUT_FOR_DELIVERY", label: "Raaste me" },
  { value: "DELIVERED", label: "Pahunch gaye" },
  { value: "REJECTED", label: "Mana kiye" },
  { value: "CANCELLED", label: "Cancel" },
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