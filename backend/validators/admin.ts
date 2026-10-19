import { z } from "zod";

export const listAdminProvidersQuery = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], "Status galat hai").optional(),
  page: z.coerce.number().int().min(1, "Page 1 ya usse bada hona chahiye").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit 1 se 50 ke beech rakho")
    .max(50, "Limit 1 se 50 ke beech rakho")
    .default(20),
});

export const setProviderStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], "Status galat hai"),
});