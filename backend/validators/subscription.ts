import { z } from "zod";
import { pageQuery } from "./common.js";

export const createSubscriptionSchema = z.object({
  planId: z.number("Sahi id bhejo").int("Sahi id bhejo").min(1, "Sahi id bhejo").max(2_147_483_647, "Sahi id bhejo"),
  startDate: z.string("Shuru ki tareekh chuno").regex(/^\d{4}-\d{2}-\d{2}$/, "Shuru ki tareekh chuno"),
  deliveryAddress: z
    .string("Delivery ka pata likho")
    .trim()
    .min(10, "Delivery ka poora pata likho")
    .max(250, "Pata 250 akshar se chhota rakho"),
  note: z.string().trim().max(200, "Note 200 akshar se chhota rakho").optional(),
});

export const listSubscriptionsQuery = z.object(pageQuery);

export const SUBSCRIPTION_STATUSES = ["REQUESTED", "ACTIVE", "COMPLETED", "REJECTED", "CANCELLED"] as const;

export const listProviderSubscriptionsQuery = z.object({
  ...pageQuery,
  status: z.enum(SUBSCRIPTION_STATUSES, "Status galat hai").optional(),
});

export const updateSubscriptionStatusSchema = z.object({
  status: z.enum(["ACTIVE", "REJECTED", "COMPLETED", "CANCELLED"], "Status galat hai"),
});
