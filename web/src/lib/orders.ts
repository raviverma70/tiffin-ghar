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
  review: { rating: number; comment: string | null } | null;
};
