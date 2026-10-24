import { z } from "zod";
import { area, bothOrNone, latitude, LOCATION_PAIR, longitude } from "./common.js";

const providerFields = z.object({
  shopName: z.string().trim().min(2, "Dukaan ka naam likho").max(80),
  city: z.string().trim().min(2, "Shehar likho").max(60),
  address: z.string().trim().min(5, "Poora pata likho").max(200),
  pincode: z.string().trim().regex(/^\d{6}$/, "6 digit ka pincode daalo"),
  fssaiNumber: z
    .string()
    .trim()
    .regex(/^\d{14}$/, "FSSAI number 14 digit ka hota hai")
    .optional(),
  area: area.optional(),
  latitude: latitude.optional(),
  longitude: longitude.optional(),
});

export const createProviderSchema = providerFields.refine(bothOrNone, LOCATION_PAIR);

export const updateProviderSchema = providerFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Kuch to badalne ke liye bhejo")
  .refine(bothOrNone, LOCATION_PAIR);

export const openSchema = z.object({ isOpen: z.boolean() });
