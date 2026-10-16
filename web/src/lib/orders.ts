export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: "Order mil gaya, dukaan ke jawab ka intezaar",
  ACCEPTED: "Dukaan ne accept kar liya",
  PREPARING: "Ban raha hai",
  OUT_FOR_DELIVERY: "Raaste me hai",
  DELIVERED: "Pahunch gaya",
  REJECTED: "Dukaan ne mana kar diya",
  CANCELLED: "Cancel ho gaya",
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
};