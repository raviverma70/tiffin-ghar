"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch } from "@/lib/authed";
import { apiError, getT } from "@/i18n/server";

export type SubscribeState = { error: string };

// Plan lo: backend daam, din aur time khud plan se leta hai, hum sirf plan, tareekh aur pata bhejte hain
export async function subscribeAction(_prev: SubscribeState, fd: FormData): Promise<SubscribeState> {
  const { t } = await getT();
  const planId = Number(fd.get("planId"));
  const startDate = String(fd.get("startDate") ?? "").trim();
  const deliveryAddress = String(fd.get("deliveryAddress") ?? "").trim();
  const note = String(fd.get("note") ?? "").trim();

  if (!Number.isInteger(planId) || planId < 1) return { error: t("err.planNotFound") };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return { error: t("err.startDate") };

  const res = await authedFetch("/subscriptions", {
    mode: "action",
    returnTo: `/plans/${planId}`,
    method: "POST",
    body: { planId, startDate, deliveryAddress, note: note || undefined },
  });
  if (!res.ok) return { error: await apiError(res) };

  const data = (await res.json()) as { id: number };
  revalidatePath("/subscriptions");
  redirect(`/subscriptions/${data.id}?new=1`);
}
