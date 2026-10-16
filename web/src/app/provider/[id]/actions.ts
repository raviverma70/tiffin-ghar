"use server";

import { redirect } from "next/navigation";
import { authedFetch } from "@/lib/authed";

export type OrderState = { error: string };

export async function placeOrderAction(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const providerId = Number(formData.get("providerId"));
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "");
  const note = String(formData.get("note") ?? "");

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Items galat hain, page reload karo" };
  }

  const res = await authedFetch("/orders", {
    mode: "action",
    returnTo: `/provider/${providerId}`,
    method: "POST",
    body: { providerId, items, deliveryAddress, note: note || undefined },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) return { error: data?.error ?? "Kuch gadbad hui, baad me try karo" };

  redirect(`/orders/${data.id}`);
}