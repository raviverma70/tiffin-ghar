import { z } from "zod";

export const MEAL_TIMES = ["BREAKFAST", "LUNCH", "DINNER"] as const;
export const mealTime = z.enum(MEAL_TIMES, "Khane ka time galat hai");

// India ke andar ki jagah (lagbhag seema)
export const latitude = z
  .number("Location sahi nahi hai")
  .min(6, "Location India ke andar honi chahiye")
  .max(38, "Location India ke andar honi chahiye");
export const longitude = z
  .number("Location sahi nahi hai")
  .min(68, "Location India ke andar honi chahiye")
  .max(98, "Location India ke andar honi chahiye");

export const area = z.string("Area likho").trim().min(2, "Area likho").max(60, "Area 60 akshar se chhota rakho");

export const pageQuery = {
  page: z.coerce.number().int().min(1, "Page 1 ya usse bada hona chahiye").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit 1 se 50 ke beech rakho")
    .max(50, "Limit 1 se 50 ke beech rakho")
    .default(20),
};

// latitude aur longitude dono saath aayein ya dono nahi
export function bothOrNone(data: { latitude?: unknown; longitude?: unknown }) {
  return (data.latitude === undefined) === (data.longitude === undefined);
}
export const LOCATION_PAIR = "Location ke liye latitude aur longitude dono bhejo";
