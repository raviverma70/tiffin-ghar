import type { ProviderProfile } from "@/lib/provider";

export type AdminProvider = ProviderProfile & {
  createdAt: string;
  user: { phone: string };
  _count: { menuItems: number; orders: number };
};

export type AdminStats = {
  users: number;
  providersPending: number;
  providersApproved: number;
  providersRejected: number;
  orders: number;
  orders24h: number;
  delivered: number;
};

export const ADMIN_FILTERS = [
  { value: "PENDING", label: "Approval ke intezaar" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Reject kiye" },
  { value: "ALL", label: "Sab" },
];

export const PROVIDER_STATUS_TEXT: Record<string, string> = {
  PENDING: "Approval ke intezaar",
  APPROVED: "Approved",
  REJECTED: "Reject kiya",
};