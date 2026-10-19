"use server";

import { redirect } from "next/navigation";
import { providerFetch } from "@/lib/provider-api";

export async function setProviderStatusAction(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "").trim();
  const status = String(fd.get("status") ?? "").trim();
  const rawBack = String(fd.get("back") ?? "");
  const back = rawBack.startsWith("/admin") ? rawBack : "/admin";

  if (!/^\d{1,10}$/.test(id) || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    redirect(back);
  }

  const res = await providerFetch(`/admin/providers/${id}/status`, {
    mode: "action",
    returnTo: back,
    method: "PATCH",
    body: { status },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const url = new URL(back, "http://local");
    url.searchParams.set("notice", String(data?.error ?? "Kuch gadbad hui").slice(0, 200));
    redirect(url.pathname + url.search);
  }

  redirect(back);
}