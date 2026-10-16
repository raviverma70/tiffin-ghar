"use server";

import { redirect } from "next/navigation";
import { authedFetch } from "@/lib/authed";

export async function cancelOrderAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!/^\d{1,10}$/.test(id)) redirect("/orders");

  await authedFetch(`/orders/${id}/cancel`, {
    mode: "action",
    returnTo: `/orders/${id}`,
    method: "PATCH",
  });

  // Chahe cancel hua ho ya nahi, page par order ka asli status dikhega
  redirect(`/orders/${id}`);
}