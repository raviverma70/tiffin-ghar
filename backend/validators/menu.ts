import { z } from "zod";
import { mealTime } from "./common.js";

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(2, "Dish ka naam likho").max(80),
  description: z.string().trim().max(300).optional(),
  pricePaise: z
    .number("Daam number me daalo")
    .int("Daam paise me, poora number daalo (₹85 = 8500)")
    .min(100, "Daam kam se kam ₹1 ho")
    .max(1_000_000, "Daam ₹10,000 se zyada nahi ho sakta"),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  mealTime: mealTime.optional(),
});

export const updateMenuItemSchema = createMenuItemSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Kuch to badalne ke liye bhejo");
