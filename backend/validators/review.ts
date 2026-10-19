import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number("Rating 1 se 5 ke beech chuno")
    .int("Rating 1 se 5 ke beech chuno")
    .min(1, "Rating 1 se 5 ke beech chuno")
    .max(5, "Rating 1 se 5 ke beech chuno"),
  comment: z.string().trim().max(500, "Review 500 akshar se chhota rakho").optional(),
});

export const listReviewsQuery = z.object({
  page: z.coerce.number().int().min(1, "Page 1 ya usse bada hona chahiye").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit 1 se 50 ke beech rakho")
    .max(50, "Limit 1 se 50 ke beech rakho")
    .default(20),
});