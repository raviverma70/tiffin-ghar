import type { MessageKey } from "@/i18n/messages/hinglish";

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

// Customer ko status ka text (bhasha ki key): t(STATUS_KEY[order.status])
export const STATUS_KEY: Record<OrderStatus, MessageKey> = {
  PLACED: "status.PLACED",
  ACCEPTED: "status.ACCEPTED",
  PREPARING: "status.PREPARING",
  OUT_FOR_DELIVERY: "status.OUT_FOR_DELIVERY",
  DELIVERED: "status.DELIVERED",
  REJECTED: "status.REJECTED",
  CANCELLED: "status.CANCELLED",
};

export type OrderItem = {
  id: number;
  name: string;
  pricePaise: number;
  quantity: number;
};

export type Order = {
  id: number;
  status: OrderStatus;
  paymentMethod: string;
  totalPaise: number;
  deliveryAddress: string;
  note: string | null;
  createdAt: string;
  provider: { id: number; shopName: string };
  items: OrderItem[];
  review: { id: number; rating: number; comment: string | null; photos: { id: number; url: string }[] } | null;
};

// Status ke rang (badge): har jagah ek jaise. Neela = naya, peela = ban raha, baingani = raste me, hara = pahuncha, laal = band
export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  PLACED: "bg-blue-50 text-blue-700 ring-blue-200",
  ACCEPTED: "bg-sky-50 text-sky-700 ring-sky-200",
  PREPARING: "bg-amber-50 text-amber-800 ring-amber-200",
  OUT_FOR_DELIVERY: "bg-violet-50 text-violet-700 ring-violet-200",
  DELIVERED: "bg-green-50 text-green-700 ring-green-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED: "bg-gray-100 text-gray-600 ring-gray-200",
};

export const ORDER_STATUS_ICON: Record<OrderStatus, string> = {
  PLACED: "🧾",
  ACCEPTED: "👍",
  PREPARING: "🍳",
  OUT_FOR_DELIVERY: "🛵",
  DELIVERED: "✅",
  REJECTED: "✖",
  CANCELLED: "✖",
};

// Order ka raasta (timeline)
export const ORDER_STEPS: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

// Badge aur timeline ke chhote naam
export const STEP_KEY: Record<OrderStatus, MessageKey> = {
  PLACED: "step.PLACED",
  ACCEPTED: "step.ACCEPTED",
  PREPARING: "step.PREPARING",
  OUT_FOR_DELIVERY: "step.OUT_FOR_DELIVERY",
  DELIVERED: "step.DELIVERED",
  REJECTED: "step.REJECTED",
  CANCELLED: "step.CANCELLED",
};
