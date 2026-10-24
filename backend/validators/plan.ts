import { z } from "zod";
import { mealTime } from "./common.js";

const planFields = z.object({
  name: z.string("Plan ka naam likho").trim().min(2, "Plan ka naam likho").max(60, "Plan ka naam 60 akshar se chhota rakho"),
  description: z.string().trim().max(300, "Jaankari 300 akshar se chhoti rakho").optional(),
  days: z
    .number("Plan kitne din ka hai, number me daalo")
    .int("Plan kitne din ka hai, number me daalo")
    .min(1, "Plan 1 se 31 din ka ho sakta hai")
    .max(31, "Plan 1 se 31 din ka ho sakta hai"),
  mealTimes: z
    .array(mealTime, "Kam se kam ek khane ka time chuno")
    .min(1, "Kam se kam ek khane ka time chuno")
    .max(3)
    .refine((list) => new Set(list).size === list.length, "Ek time do baar mat chuno"),
  pricePaise: z
    .number("Daam number me daalo")
    .int("Daam paise me, poora number daalo (₹85 = 8500)")
    .min(100, "Daam kam se kam ₹1 ho")
    .max(10_000_000, "Plan ka daam ₹1,00,000 se zyada nahi ho sakta"),
  isVeg: z.boolean().optional(),
});

export const createPlanSchema = planFields;

export const updatePlanSchema = planFields
  .extend({ isActive: z.boolean().optional() })
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Kuch to badalne ke liye bhejo");

const dish = z.string().trim().min(1, "Dish ka naam likho").max(60, "Dish ka naam 60 akshar se chhota rakho");

// Poora din-wise menu ek saath (jo din/time bheja wahi rahega, baaki hat jayega)
export const planMenuSchema = z.object({
  items: z
    .array(
      z.object({
        day: z.number("Din number me daalo").int().min(1, "Din galat hai").max(31, "Din galat hai"),
        mealTime,
        dishes: z.array(dish, "Dishes ki list bhejo").min(1, "Har time me kam se kam ek dish likho").max(12, "Ek time me 12 se zyada dishes nahi"),
      }),
      "Menu ki list bhejo",
    )
    .max(93, "Menu bahut lamba hai"),
});
