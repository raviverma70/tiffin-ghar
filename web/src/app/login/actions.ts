"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { clearSession, getRefreshToken, safeNext, setSession } from "@/lib/session";

export type LoginState = {
  step: "phone" | "otp";
  phone: string;
  error: string;
};

type VerifyResponse = { accessToken: string; refreshToken: string };
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function callApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: json?.error ?? "Kuch gadbad hui, baad me try karo" };
    }
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "Server se baat nahi ho pa rahi, baad me try karo" };
  }
}

export async function loginAction(
  prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // "Number badlo" button
  if (formData.get("intent") === "back") {
    return { step: "phone", phone: prev.phone, error: "" };
  }

  // Step 1: OTP maango
  if (prev.step === "phone") {
    const phone = String(formData.get("phone") ?? "").trim();
    const result = await callApi<unknown>("/auth/send-otp", { phone });
    if (!result.ok) return { step: "phone", phone, error: result.error };
    return { step: "otp", phone, error: "" };
  }

  // Step 2: OTP check karo
  const code = String(formData.get("code") ?? "").trim();
  const next = safeNext(String(formData.get("next") ?? "/"));

  const result = await callApi<VerifyResponse>("/auth/verify-otp", {
    phone: prev.phone,
    code,
  });
  if (!result.ok) return { step: "otp", phone: prev.phone, error: result.error };

  await setSession(result.data.accessToken, result.data.refreshToken);
  redirect(next); // redirect try/catch ke bahar hi rakhna
}

export async function logoutAction() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await callApi<unknown>("/auth/logout", { refreshToken });
  }
  await clearSession();
  redirect("/");
}