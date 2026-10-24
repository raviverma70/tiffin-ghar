"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { providerFetch } from "@/lib/provider-api";
import { isMealTime, rupeesToPaise, type MealTime } from "@/lib/provider";
import { apiError, getT } from "@/i18n/server";

export type PlanFormState = { error: string; saved?: boolean };

function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function planId(fd: FormData): string | null {
  const id = text(fd, "planId");
  return /^\d{1,10}$/.test(id) ? id : null;
}

// Wapas page par bhejo, upar ek chhota message ke saath (?notice=...)
function withNotice(path: string, notice: string) {
  const url = new URL(path, "http://local");
  url.searchParams.set("notice", notice.slice(0, 200));
  return url.pathname + url.search;
}

type PlanBody = {
  name: string;
  description: string;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  isVeg: boolean;
};

async function readPlanForm(fd: FormData): Promise<{ error: string } | { body: PlanBody }> {
  const { t } = await getT();

  const days = Number(text(fd, "days"));
  if (!Number.isInteger(days) || days < 1 || days > 31) return { error: t("err.planDaysRange") };

  const mealTimes = fd.getAll("mealTimes").map(String).filter(isMealTime);
  if (mealTimes.length === 0) return { error: t("err.mealTimesMin") };

  const pricePaise = rupeesToPaise(text(fd, "price"));
  if (pricePaise === null) return { error: t("err.priceRupees") };

  return {
    body: {
      name: text(fd, "name"),
      description: text(fd, "description"),
      days,
      mealTimes: [...new Set(mealTimes)],
      pricePaise,
      isVeg: fd.get("isVeg") === "on",
    },
  };
}

export async function createPlanAction(_prev: PlanFormState, fd: FormData): Promise<PlanFormState> {
  const parsed = await readPlanForm(fd);
  if ("error" in parsed) return { error: parsed.error };

  const res = await providerFetch("/providers/me/plans", {
    mode: "action",
    returnTo: "/dashboard/plans",
    method: "POST",
    body: { ...parsed.body, description: parsed.body.description || undefined },
  });
  if (!res.ok) return { error: await apiError(res) };

  const plan = (await res.json()) as { id: number };
  revalidatePath("/dashboard/plans");
  // Seedha menu bharne wale page par
  redirect(`/dashboard/plans/${plan.id}`);
}

export async function updatePlanAction(_prev: PlanFormState, fd: FormData): Promise<PlanFormState> {
  const { t } = await getT();
  const id = planId(fd);
  if (!id) return { error: t("plans.notFound") };

  const parsed = await readPlanForm(fd);
  if ("error" in parsed) return { error: parsed.error };

  const res = await providerFetch(`/providers/me/plans/${id}`, {
    mode: "action",
    returnTo: `/dashboard/plans/${id}`,
    method: "PATCH",
    body: parsed.body,
  });
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath(`/dashboard/plans/${id}`);
  revalidatePath("/dashboard/plans");
  return { error: "", saved: true };
}

// Grid se aaya JSON: [{ day, mealTime, dishes }]. Khali time hata dete hain.
function readMenu(raw: string) {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length > 93) return null;

  const items: { day: number; mealTime: MealTime; dishes: string[] }[] = [];
  for (const row of data) {
    if (typeof row !== "object" || row === null) return null;
    const { day, mealTime, dishes } = row as Record<string, unknown>;
    if (!Number.isInteger(day) || !isMealTime(mealTime) || !Array.isArray(dishes)) return null;
    const clean = dishes
      .filter((d): d is string => typeof d === "string")
      .map((d) => d.trim())
      .filter(Boolean)
      .slice(0, 12);
    if (clean.length > 0) items.push({ day: day as number, mealTime, dishes: clean });
  }
  return items;
}

export async function savePlanMenuAction(_prev: PlanFormState, fd: FormData): Promise<PlanFormState> {
  const { t } = await getT();
  const id = planId(fd);
  if (!id) return { error: t("plans.notFound") };

  const items = readMenu(text(fd, "menu"));
  if (!items) return { error: t("err.menuList") };

  const res = await providerFetch(`/providers/me/plans/${id}/menu`, {
    mode: "action",
    returnTo: `/dashboard/plans/${id}`,
    method: "PUT",
    body: { items },
  });
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath(`/dashboard/plans/${id}`);
  revalidatePath("/dashboard/plans");
  return { error: "", saved: true };
}

export async function togglePlanAction(fd: FormData): Promise<void> {
  const id = planId(fd);
  if (!id) redirect("/dashboard/plans");
  const back = `/dashboard/plans/${id}`;

  const res = await providerFetch(`/providers/me/plans/${id}`, {
    mode: "action",
    returnTo: back,
    method: "PATCH",
    body: { isActive: text(fd, "active") === "true" },
  });
  // Adhoora menu ho to backend mana karta hai, message upar dikhega
  if (!res.ok) redirect(withNotice(back, await apiError(res)));
  revalidatePath(back);
  revalidatePath("/dashboard/plans");
}

export async function deletePlanAction(fd: FormData): Promise<void> {
  const id = planId(fd);
  if (!id) redirect("/dashboard/plans");

  const res = await providerFetch(`/providers/me/plans/${id}`, {
    mode: "action",
    returnTo: `/dashboard/plans/${id}`,
    method: "DELETE",
  });
  if (!res.ok) redirect(withNotice(`/dashboard/plans/${id}`, await apiError(res)));

  const data = (await res.json()) as { deleted: boolean };
  revalidatePath("/dashboard/plans");
  if (data.deleted) redirect("/dashboard/plans");

  // Subscriptions wala plan sirf band hua
  const { t } = await getT();
  redirect(withNotice(`/dashboard/plans/${id}`, t("plans.deactivated")));
}
