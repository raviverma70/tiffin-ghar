"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch } from "@/lib/authed";
import { apiError } from "@/i18n/server";

function withNotice(path: string, notice: string) {
  const url = new URL(path, "http://local");
  url.searchParams.set("notice", notice.slice(0, 200));
  return url.pathname + url.search;
}

// Sirf REQUESTED (dukaan ne chalu nahi kiya) cancel hota hai, baaki par backend mana karta hai
export async function cancelSubscriptionAction(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "");
  if (!/^\d{1,10}$/.test(id)) redirect("/subscriptions");
  const back = `/subscriptions/${id}`;

  const res = await authedFetch(`/subscriptions/${id}/cancel`, { mode: "action", returnTo: back, method: "PATCH" });
  if (!res.ok) redirect(withNotice(back, await apiError(res)));

  revalidatePath("/subscriptions");
  // ?new=1 hata do, warna "request bhej di" wala message cancel ke baad bhi dikhta
  redirect(back);
}
