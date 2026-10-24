"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch } from "@/lib/authed";
import { apiError, getT } from "@/i18n/server";

export type OrderState = { error: string };

export async function placeOrderAction(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const { t } = await getT();

  const providerId = Number(formData.get("providerId"));
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "");
  const note = String(formData.get("note") ?? "");

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: t("err.itemsBad") };
  }

  const res = await authedFetch("/orders", {
    mode: "action",
    returnTo: `/provider/${providerId}`,
    method: "POST",
    body: { providerId, items, deliveryAddress, note: note || undefined },
  });

  if (!res.ok) return { error: await apiError(res) };

  const data = await res.json();
  redirect(`/orders/${data.id}`);
}

// Dil dabaya: pasand me jodo ya hatao. Naya haal wapas deta hai.
export async function toggleFavouriteAction(providerId: number, favourite: boolean): Promise<boolean> {
  if (!Number.isInteger(providerId) || providerId < 1) return !favourite;

  const res = await authedFetch(`/me/favourites/${providerId}`, {
    mode: "action",
    returnTo: `/provider/${providerId}`,
    method: favourite ? "PUT" : "DELETE",
  });
  if (!res.ok) return !favourite;

  revalidatePath("/favourites");
  return favourite;
}
