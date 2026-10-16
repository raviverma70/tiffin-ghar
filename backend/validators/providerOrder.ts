import { z } from "zod";

const ALL_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
] as const;

export const listProviderOrdersQuery = z.object({
  status: z.enum(ALL_STATUSES, "Status galat hai").optional(),
  page: z.coerce.number().int().min(1, "Page 1 ya usse bada hona chahiye").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit 1 se 50 ke beech rakho")
    .max(50, "Limit 1 se 50 ke beech rakho")
    .default(20),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ["ACCEPTED", "REJECTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"],
    "Status galat hai",
  ),
});