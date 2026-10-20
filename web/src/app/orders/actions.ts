"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch } from "@/lib/authed";
import { apiError } from "@/i18n/server";

export type ReviewState = { error: string };

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

export async function submitReviewAction(_prev: ReviewState, fd: FormData): Promise<ReviewState> {
  const id = String(fd.get("id") ?? "");
  if (!/^\d{1,10}$/.test(id)) redirect("/orders");

  const rating = Number(String(fd.get("rating") ?? ""));
  const comment = String(fd.get("comment") ?? "").trim();

  const res = await authedFetch(`/orders/${id}/review`, {
    mode: "action",
    returnTo: `/orders/${id}`,
    method: "POST",
    body: { rating, comment: comment || undefined },
  });

  if (!res.ok) return { error: await apiError(res) };

  revalidatePath(`/orders/${id}`);
  redirect(`/orders/${id}`);
}
