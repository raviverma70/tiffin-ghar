"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch, refreshInline } from "@/lib/authed";
import { providerFetch } from "@/lib/provider-api";
import { rupeesToPaise } from "@/lib/provider";
import { uploadImage } from "@/lib/upload";
import { apiError, getT } from "@/i18n/server";
import type { Translator } from "@/i18n/translate";

export type FormState = { error: string; saved?: boolean };

const NEXT_STATUS_LIST = ["ACCEPTED", "REJECTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

// Wapas page par bhejo, upar ek chhota message ke saath (?notice=...)
function withNotice(path: string, notice: string) {
  const url = new URL(path, "http://local");
  url.searchParams.set("notice", notice.slice(0, 200));
  return url.pathname + url.search;
}

// ---------- Dukaan ki profile ----------

function profileBody(fd: FormData) {
  const fssai = text(fd, "fssaiNumber");
  return {
    shopName: text(fd, "shopName"),
    city: text(fd, "city"),
    address: text(fd, "address"),
    pincode: text(fd, "pincode"),
    fssaiNumber: fssai || undefined,
  };
}

export async function createProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const res = await authedFetch("/providers", {
    mode: "action",
    returnTo: "/dashboard",
    method: "POST",
    body: profileBody(fd),
  });
  if (!res.ok) return { error: await apiError(res) };

  // Role CUSTOMER se PROVIDER ho gaya, par purane token me purana role hai. Naya token lo.
  await refreshInline();

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const res = await providerFetch("/providers/me", {
    mode: "action",
    returnTo: "/dashboard",
    method: "PATCH",
    body: profileBody(fd),
  });
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath("/dashboard");
  return { error: "", saved: true };
}

export async function toggleOpenAction(fd: FormData): Promise<void> {
  const isOpen = text(fd, "isOpen") === "true";
  const res = await providerFetch("/providers/me/open", {
    mode: "action",
    returnTo: "/dashboard",
    method: "PATCH",
    body: { isOpen },
  });
  if (!res.ok) redirect(withNotice("/dashboard", await apiError(res)));
  revalidatePath("/dashboard");
}

// ---------- Menu ----------

type MenuBody = {
  name: string;
  description: string | undefined;
  pricePaise: number;
  dayOfWeek: number | null;
  isVeg: boolean;
  isAvailable: boolean;
};

type MenuForm = { error: string; body: null } | { error: null; body: MenuBody };

function readMenuForm(fd: FormData, forUpdate: boolean, t: Translator): MenuForm {
  const price = rupeesToPaise(text(fd, "price"));
  if (price === null) {
    return { error: t("err.priceRupees"), body: null };
  }

  const day = text(fd, "dayOfWeek");
  if (day !== "" && !/^[0-6]$/.test(day)) {
    return { error: t("err.dayBad"), body: null };
  }

  const description = text(fd, "description");
  return {
    error: null,
    body: {
      name: text(fd, "name"),
      // update me khali "" bhejte hain taaki purana description hat sake
      description: description || (forUpdate ? "" : undefined),
      pricePaise: price,
      dayOfWeek: day === "" ? null : Number(day),
      isVeg: fd.get("isVeg") === "on",
      isAvailable: fd.get("isAvailable") === "on",
    },
  };
}

export async function createMenuItemAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { t } = await getT();
  const parsed = readMenuForm(fd, false, t);
  if (!parsed.body) return { error: parsed.error };

  const res = await providerFetch("/providers/me/menu", {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "POST",
    body: parsed.body,
  });
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath("/dashboard/menu");
  // ?added=... se form naya khali ban jata hai (page par key badalti hai)
  redirect(`/dashboard/menu?added=${Date.now()}`);
}

export async function updateMenuItemAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { t } = await getT();
  const id = text(fd, "id");
  if (!/^\d{1,10}$/.test(id)) return { error: t("err.itemBad") };

  const parsed = readMenuForm(fd, true, t);
  if (!parsed.body) return { error: parsed.error };

  const res = await providerFetch(`/providers/me/menu/${id}`, {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "PATCH",
    body: parsed.body,
  });
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath("/dashboard/menu");
  redirect("/dashboard/menu");
}

export async function toggleAvailableAction(fd: FormData): Promise<void> {
  const id = text(fd, "id");
  if (!/^\d{1,10}$/.test(id)) redirect("/dashboard/menu");

  const res = await providerFetch(`/providers/me/menu/${id}`, {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "PATCH",
    body: { isAvailable: text(fd, "available") === "true" },
  });
  if (!res.ok) redirect(withNotice("/dashboard/menu", await apiError(res)));
  revalidatePath("/dashboard/menu");
}

export async function deleteMenuItemAction(fd: FormData): Promise<void> {
  const id = text(fd, "id");
  if (!/^\d{1,10}$/.test(id)) redirect("/dashboard/menu");

  const res = await providerFetch(`/providers/me/menu/${id}`, {
    mode: "action",
    returnTo: "/dashboard/menu",
    method: "DELETE",
  });
  if (!res.ok) redirect(withNotice("/dashboard/menu", await apiError(res)));
  revalidatePath("/dashboard/menu");
}

// ---------- Orders ----------

export async function updateOrderStatusAction(fd: FormData): Promise<void> {
  const id = text(fd, "id");
  const status = text(fd, "status");
  const rawBack = text(fd, "back");
  const back = rawBack.startsWith("/dashboard/orders") ? rawBack : "/dashboard/orders";

  if (!/^\d{1,10}$/.test(id) || !NEXT_STATUS_LIST.includes(status)) redirect(back);

  const res = await providerFetch(`/providers/me/orders/${id}/status`, {
    mode: "action",
    returnTo: back,
    method: "PATCH",
    body: { status },
  });

  // Customer ne beech me cancel kar diya ho to 409 aata hai, message upar dikhega
  if (!res.ok) redirect(withNotice(back, await apiError(res)));
  redirect(back);
}

// ---------- Photo ----------

export type PhotoState = { error: string };

function photoPath(kind: string, id: string): string | null {
  if (kind === "shop") return "/providers/me/photo";
  if (kind === "menu" && /^\d{1,10}$/.test(id)) return `/providers/me/menu/${id}/photo`;
  return null;
}

export async function uploadPhotoAction(_prev: PhotoState, fd: FormData): Promise<PhotoState> {
  const { t } = await getT();
  const path = photoPath(text(fd, "kind"), text(fd, "id"));
  const file = fd.get("file");
  if (!path || !(file instanceof File) || file.size === 0) return { error: t("err.photoMissing") };
  if (file.size > 900_000) return { error: t("err.photoLarge") };

  const res = await uploadImage(path, await file.arrayBuffer(), file.type || "image/jpeg", "/dashboard");
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  return { error: "" };
}

export async function removePhotoAction(_prev: PhotoState, fd: FormData): Promise<PhotoState> {
  const { t } = await getT();
  const path = photoPath(text(fd, "kind"), text(fd, "id"));
  if (!path) return { error: t("err.photoMissing") };

  const res = await providerFetch(path, {
    mode: "action",
    returnTo: "/dashboard",
    method: "DELETE",
  });
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  return { error: "" };
}
