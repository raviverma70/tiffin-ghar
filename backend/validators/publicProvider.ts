import { z } from "zod";
import { area, latitude, longitude } from "./common.js";

export const listProvidersQuery = z
  .object({
    city: z.string("Shehar likho").trim().min(2, "Shehar likho").max(60),
    pincode: z.string().trim().regex(/^\d{6}$/, "6 digit ka pincode daalo").optional(),
    area: area.optional(),
    // Customer ki location (sirf sort ke liye, save nahi hoti)
    lat: z.coerce.number().pipe(latitude).optional(),
    lng: z.coerce.number().pipe(longitude).optional(),
    sort: z.enum(["rating", "distance"], "Sort galat hai").optional(),
    veg: z.literal("1").optional(), // sirf pure veg dukaanein
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .refine((q) => (q.lat === undefined) === (q.lng === undefined), "Location ke liye latitude aur longitude dono bhejo")
  .refine((q) => q.sort !== "distance" || q.lat !== undefined, "Paas ki dukaan ke liye location chahiye");

export const listPlansQuery = z.object({
  city: z.string("Shehar likho").trim().min(2, "Shehar likho").max(60),
  area: area.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
