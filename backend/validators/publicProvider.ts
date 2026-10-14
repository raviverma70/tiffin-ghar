import { z } from "zod";

export const listProvidersQuery = z.object({
 city: z.string("Shehar likho").trim().min(2, "Shehar likho").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "6 digit ka pincode daalo").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});