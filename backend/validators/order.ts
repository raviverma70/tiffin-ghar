import { z } from "zod";

const id = z
  .number("Sahi id bhejo")
  .int("Sahi id bhejo")
  .min(1, "Sahi id bhejo")
  .max(2_147_483_647, "Sahi id bhejo");

export const createOrderSchema = z.object({
  providerId: id,
  items: z
    .array(
      z.object({
        menuItemId: id,
        quantity: z
          .number("Quantity number me daalo")
          .int("Quantity poora number ho")
          .min(1, "Quantity 1 se 20 ke beech rakho")
          .max(20, "Quantity 1 se 20 ke beech rakho"),
      }),
      "Items ki list bhejo",
    )
    .min(1, "Kam se kam ek item chuno")
    .max(20, "Ek order me 20 se zyada alag items nahi ho sakte"),
  deliveryAddress: z
    .string("Delivery ka pata likho")
    .trim()
    .min(10, "Delivery ka poora pata likho")
    .max(250, "Pata 250 akshar se chhota rakho"),
  note: z.string().trim().max(200, "Note 200 akshar se chhota rakho").optional(),
});